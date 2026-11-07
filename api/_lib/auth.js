import { getAdminAuth } from './firebaseAdmin.js';
import { AppError } from './http.js';

/**
 * Check whether a Firebase UID is present in the ADMIN_UIDS environment list.
 * @param {string} uid
 * @returns {boolean}
 */
export function checkIsAdmin(uid) {
  if (!uid) return false;
  const adminUidsRaw = process.env.ADMIN_UIDS || '';
  const adminUids = adminUidsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return adminUids.includes(uid);
}

/**
 * Verify incoming HTTP request's Firebase ID token in Authorization header.
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

  const idToken = match[1];
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      token: decoded,
    };
  } catch (err) {
    throw AppError.unauthorized('Invalid or expired Firebase ID token.');
  }
}

/**
 * Verify request and ensure the authenticated user has an admin UID.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{ uid: string, email: string, isAdmin: true }>}
 */
export async function requireAdmin(req) {
  const { uid, email } = await verifyRequest(req);
  if (!checkIsAdmin(uid)) {
    throw AppError.forbidden('Admin access required.');
  }
  return { uid, email, isAdmin: true };
}
