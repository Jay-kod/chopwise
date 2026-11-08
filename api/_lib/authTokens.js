import crypto from 'node:crypto';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.CONFIG_ENCRYPTION_KEY ||
  'chopwise-xampp-mysql-local-secret-key-32chars';

/**
 * Hash a plain password using scrypt with a random 16-byte salt.
 * @param {string} password
 * @returns {string} Format: "salt:hash"
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compare password against stored "salt:hash" using timing-safe comparison.
 * @param {string} password
 * @param {string} stored
 * @returns {boolean}
 */
export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) {
    return false;
  }
  const [salt, key] = stored.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Sign a payload as a compact HMAC-SHA256 JWT token.
 * @param {object} payload
 * @param {number} [expiresInSeconds=604800] 7 days default
 * @returns {string}
 */
export function signToken(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Body = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Body}`)
    .digest('base64url');

  return `${b64Header}.${b64Body}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 JWT token.
 * @param {string} token
 * @returns {object|null}
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [b64Header, b64Body, signature] = parts;

  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Body}`)
    .digest('base64url');

  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(b64Body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

