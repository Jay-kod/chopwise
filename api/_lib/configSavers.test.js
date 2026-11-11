import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveConfig } from './configSavers.js';

describe('saveConfig integration credentials', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('explains that a valid encryption key is required to save USDA credentials', async () => {
    vi.stubEnv('CONFIG_ENCRYPTION_KEY', '');

    await expect(
      saveConfig('usda', { apiKey: 'usda-test-key' })
    ).rejects.toMatchObject({
      code: 'NOT_CONFIGURED',
      message: expect.stringContaining('CONFIG_ENCRYPTION_KEY'),
    });
  });

  it('rejects an invalid encryption key before attempting to save credentials', async () => {
    vi.stubEnv('CONFIG_ENCRYPTION_KEY', 'invalid');

    await expect(
      saveConfig('usda', { apiKey: 'usda-test-key' })
    ).rejects.toMatchObject({
      code: 'NOT_CONFIGURED',
      message: expect.stringContaining('valid 32-byte base64 key'),
    });
  });
});
