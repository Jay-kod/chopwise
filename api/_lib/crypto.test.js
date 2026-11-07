import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { encrypt, decrypt } from './crypto';

const TEST_KEY = crypto.randomBytes(32).toString('base64');
const WRONG_KEY = crypto.randomBytes(32).toString('base64');

describe('api/_lib/crypto', () => {
  it('round-trips encryption and decryption accurately', () => {
    const secret = 'AIzaSyChopWiseSecretTestKey12345';
    const encrypted = encrypt(secret, TEST_KEY);

    expect(encrypted.startsWith('v1:')).toBe(true);
    expect(encrypted.split(':')).toHaveLength(4);

    const decrypted = decrypt(encrypted, TEST_KEY);
    expect(decrypted).toBe(secret);
  });

  it('fails decryption when tampered', () => {
    const secret = 'SuperSecret123';
    const encrypted = encrypt(secret, TEST_KEY);
    const parts = encrypted.split(':');

    // Tamper with ciphertext by altering last character
    parts[3] = parts[3].slice(0, -2) + 'AA';
    const tampered = parts.join(':');

    expect(() => decrypt(tampered, TEST_KEY)).toThrow(/Decryption failed/);
  });

  it('fails decryption when decrypted with a different key', () => {
    const secret = 'SensitiveApiKey';
    const encrypted = encrypt(secret, TEST_KEY);

    expect(() => decrypt(encrypted, WRONG_KEY)).toThrow(/Decryption failed/);
  });

  it('rejects invalid formatted strings', () => {
    expect(() => decrypt('not-encrypted', TEST_KEY)).toThrow(/Invalid encrypted format/);
    expect(() => decrypt('v2:a:b:c', TEST_KEY)).toThrow(/Invalid encrypted format/);
  });
});

