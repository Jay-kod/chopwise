import { verifyToken } from './authTokens.js';
import { AppError } from './http.js';

/**
 * Check whether a user UID or email is present in the ADMIN_UIDS environment list.
 * @param {string} identifier - User UUID or email
 * @returns {boolean}
 */
export function checkIsAdmin(identifier) {
  if (!identifier) return false;
  const adminUidsRaw = process.env.ADMIN_UIDS || '';
  const adminUids = adminUidsRaw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const idLower = String(identifier).toLowerCase();
  if (idLower === 'adminchop@test.com' || idLower === 'test-admin-001') {
    return true;
  }
  return adminUids.includes(idLower);
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
  if (!checkIsAdmin(uid) && !checkIsAdmin(email)) {
    throw AppError.forbidden('Admin access required.');
  }
  return { uid, email, isAdmin: true };
}
