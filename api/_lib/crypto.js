import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const PREFIX = 'v1';

/**
 * Resolve the 32-byte encryption key from an optional override or environment.
 * @param {string} [keyB64]
 * @returns {Buffer}
 */
function getKey(keyB64) {
  const b64 = keyB64 || process.env.CONFIG_ENCRYPTION_KEY;
  if (!b64) {
    throw new Error('CONFIG_ENCRYPTION_KEY is not configured in the environment.');
  }

  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) {
    throw new Error(
      `CONFIG_ENCRYPTION_KEY must be a 32-byte base64 string (got ${key.length} bytes).`
    );
  }
  return key;
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Output format: v1:<iv_b64>:<tag_b64>:<ciphertext_b64>
 * @param {string} text - Plaintext to encrypt
 * @param {string} [keyB64] - Optional base64-encoded 32-byte key
 * @returns {string} Encrypted string
 */
export function encrypt(text, keyB64) {
  if (text == null) {
    throw new Error('Cannot encrypt null or undefined value.');
  }

  const key = getKey(keyB64);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(String(text), 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return `${PREFIX}:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * @param {string} encryptedStr - Formatted string (v1:<iv>:<tag>:<ciphertext>)
 * @param {string} [keyB64] - Optional base64-encoded 32-byte key
 * @returns {string} Decrypted plaintext utf8 string
 */
export function decrypt(encryptedStr, keyB64) {
  if (!encryptedStr || typeof encryptedStr !== 'string') {
    throw new Error('Encrypted string must be a non-empty string.');
  }

  const parts = encryptedStr.split(':');
  if (parts.length !== 4 || parts[0] !== PREFIX) {
    throw new Error('Invalid encrypted format. Expected v1:iv:tag:ciphertext.');
  }

  const [, ivB64, tagB64, dataB64] = parts;
  const key = getKey(keyB64);
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    throw new Error('Decryption failed: authentication tag verification failed (tampered or wrong key).');
  }
}
