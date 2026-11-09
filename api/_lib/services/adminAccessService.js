import { AppError } from '../http.js';
import { query } from '../mysql.js';
import { accountIdSchema, grantAdminSchema } from '../schemas.js';
import { getBootstrapAdminIds, isBootstrapAdmin } from '../auth.js';
import { runAuditedAdminMutation } from './adminAuditService.js';

/**
 * Lists protected bootstrap admins and active database-managed admins.
 * @returns {Promise<{items: object[]}>}
 */
export async function listAdmins() {
  const bootstrapIds = getBootstrapAdminIds();
  const bootstrapAccounts = bootstrapIds.length
    ? await query(
      `SELECT id, email, created_at FROM users WHERE id IN (${bootstrapIds.map(() => '?').join(', ')})`,
      bootstrapIds
    )
    : [];
  const bootstrapById = new Map(bootstrapAccounts.map((account) => [account.id, account]));
  const managed = await query(
    `SELECT u.id, u.email, ar.created_at FROM admin_roles ar
     JOIN users u ON u.id = ar.user_id WHERE u.is_active = 1 ORDER BY ar.created_at DESC`
  );
  const items = bootstrapIds.map((id) => ({
    id,
    email: bootstrapById.get(id)?.email || null,
    createdAt: bootstrapById.get(id)?.created_at || null,
    bootstrap: true,
  }));
  items.push(...managed.map((account) => ({ ...account, bootstrap: false })));
  return { items };
}

/**
 * Grants administrator access to an existing active account.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function grantAdmin(actorId, input) {
  const { email } = grantAdminSchema.parse(input);
  const normalizedEmail = email.toLowerCase();
  return runAuditedAdminMutation(actorId, 'admin.access.granted', 'admin', normalizedEmail, async (connection) => {
    const [accounts] = await connection.execute(
      'SELECT id, is_active FROM users WHERE email = ? LIMIT 1 FOR UPDATE',
      [normalizedEmail]
    );
    if (!accounts.length || !Boolean(accounts[0].is_active)) {
      throw AppError.notFound('An active registered account with this email was not found.');
    }
    const userId = accounts[0].id;
    if (isBootstrapAdmin(userId)) {
      throw AppError.validation({ email: 'This account is already a protected bootstrap administrator.' });
    }
    await connection.execute(
      'INSERT INTO admin_roles (user_id, granted_by) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)',
      [userId, actorId]
    );
    return { result: { ok: true }, auditDetails: { granted: true } };
  });
}

/**
 * Revokes a database-managed administrator role without affecting bootstrap admins.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function revokeAdmin(actorId, input) {
  const { userId } = accountIdSchema.parse(input);
  if (isBootstrapAdmin(userId)) {
    throw AppError.validation({ userId: 'Bootstrap administrator access cannot be revoked.' });
  }
  return runAuditedAdminMutation(actorId, 'admin.access.revoked', 'admin', userId, async (connection) => {
    const [admins] = await connection.execute('SELECT user_id FROM admin_roles WHERE user_id = ? FOR UPDATE', [userId]);
    if (!admins.length) throw AppError.notFound('Managed administrator not found.');
    await connection.execute('DELETE FROM admin_roles WHERE user_id = ?', [userId]);
    return { result: { ok: true }, auditDetails: { revoked: true } };
  });
}
