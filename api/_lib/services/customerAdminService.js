import { AppError } from '../http.js';
import { query } from '../mysql.js';
import { adminListSchema, customerActiveSchema, updateCustomerSchema } from '../schemas.js';
import { getBootstrapAdminIds, isBootstrapAdmin } from '../auth.js';
import { runAuditedAdminMutation } from './adminAuditService.js';

function customerFilter(search, bootstrapIds) {
  const clauses = ['NOT EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = u.id)'];
  const values = [];
  if (bootstrapIds.length) {
    clauses.push(`u.id NOT IN (${bootstrapIds.map(() => '?').join(', ')})`);
    values.push(...bootstrapIds);
  }
  if (search) {
    clauses.push('(u.id LIKE ? OR u.email LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }
  return { where: clauses.join(' AND '), values };
}

/**
 * Lists account metadata only; health profiles and password hashes are excluded.
 * @param {object} input
 * @returns {Promise<{items: object[], total: number}>}
 */
export async function listCustomers(input) {
  const { search, offset, limit } = adminListSchema.parse(input);
  const filter = customerFilter(search, getBootstrapAdminIds());
  const totals = await query(`SELECT COUNT(*) AS total FROM users u WHERE ${filter.where}`, filter.values);
  const rows = await query(
    `SELECT u.id, u.email, u.created_at, u.profile_complete, u.is_active
     FROM users u WHERE ${filter.where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...filter.values, limit, offset]
  );
  return {
    total: Number(totals[0]?.total || 0),
    items: rows.map((row) => ({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
      profileComplete: Boolean(row.profile_complete),
      active: Boolean(row.is_active),
    })),
  };
}

/**
 * Updates the email address of a non-admin customer.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function updateCustomerEmail(actorId, input) {
  const { userId, email } = updateCustomerSchema.parse(input);
  const normalizedEmail = email.toLowerCase();
  return runAuditedAdminMutation(actorId, 'customer.email.updated', 'customer', userId, async (connection) => {
    await requireCustomer(connection, userId);
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length && existing[0].id !== userId) {
      throw AppError.validation({ email: 'An account already uses this email address.' });
    }
    await connection.execute('UPDATE users SET email = ? WHERE id = ?', [normalizedEmail, userId]);
    return { result: { ok: true }, auditDetails: { emailChanged: true } };
  });
}

/**
 * Reversibly disables or re-enables a non-admin customer account.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function setCustomerActive(actorId, input) {
  const { userId, active } = customerActiveSchema.parse(input);
  return runAuditedAdminMutation(actorId, 'customer.active.updated', 'customer', userId, async (connection) => {
    const customer = await requireCustomer(connection, userId);
    await connection.execute('UPDATE users SET is_active = ? WHERE id = ?', [active ? 1 : 0, userId]);
    return {
      result: { ok: true },
      auditDetails: { changed: Boolean(customer.is_active) !== active, active },
    };
  });
}

async function requireCustomer(connection, userId) {
  if (isBootstrapAdmin(userId)) {
    throw AppError.validation({ userId: 'Bootstrap administrators cannot be managed as customers.' });
  }
  const [accounts] = await connection.execute('SELECT id, is_active FROM users WHERE id = ? FOR UPDATE', [userId]);
  if (!accounts.length) throw AppError.notFound('Customer account not found.');
  const [admins] = await connection.execute('SELECT user_id FROM admin_roles WHERE user_id = ? LIMIT 1', [userId]);
  if (admins.length) throw AppError.validation({ userId: 'Manage this account from administrator access.' });
  return accounts[0];
}
