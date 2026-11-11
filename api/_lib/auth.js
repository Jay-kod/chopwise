import { verifyToken } from './authTokens.js';
import { AppError } from './http.js';
import { query } from './mysql.js';

let dynamicBootstrapUids = [];

export function setDynamicBootstrapAdminIds(uids = []) {
  if (typeof uids === 'string') {
    dynamicBootstrapUids = uids
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  } else if (Array.isArray(uids)) {
    dynamicBootstrapUids = uids
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
  }
}

export function getBootstrapAdminIds() {
  const adminUidsRaw = process.env.ADMIN_UIDS || '';
  const fromEnv = adminUidsRaw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...fromEnv, ...dynamicBootstrapUids]));
}

export function isBootstrapAdmin(userId) {
  return Boolean(userId) && getBootstrapAdminIds().includes(String(userId).toLowerCase());
}

export async function checkIsAdmin(userId) {
  if (!userId) return false;
  if (isBootstrapAdmin(userId)) return true;
  const rows = await query(
    `SELECT ar.user_id FROM admin_roles ar
     JOIN users u ON u.id = ar.user_id
     WHERE ar.user_id = ? AND u.is_active = 1 LIMIT 1`,
    [userId]
  );
  return rows.length > 0;
}

/**
 * Verify incoming HTTP request's JWT token in Authorization header.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{ uid: string, email: string, token: object }>}
 */
export async function verifyRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    throw AppError.unauthorized('Missing Authorization header.');
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw AppError.unauthorized('Invalid Authorization format. Expected Bearer <token>.');
  }

  const token = match[1];
  const payload = verifyToken(token);

  if (!payload || !payload.uid) {
    throw AppError.unauthorized('Invalid or expired authentication token. Please log in.');
  }
  const accounts = await query('SELECT is_active FROM users WHERE id = ? LIMIT 1', [payload.uid]);
  if (!accounts.length || !Boolean(accounts[0].is_active)) {
    throw AppError.unauthorized('This account is unavailable. Please contact support.');
  }

  return {
    uid: payload.uid,
    email: payload.email || '',
    token: payload,
  };
}

/**
 * Verify request and ensure the authenticated user has an admin UID.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{ uid: string, email: string, isAdmin: true }>}
 */
export async function requireAdmin(req) {
  const { uid, email } = await verifyRequest(req);
  if (!(await checkIsAdmin(uid))) {
    throw AppError.forbidden('Admin access required.');
  }
  return { uid, email, isAdmin: true };
}
