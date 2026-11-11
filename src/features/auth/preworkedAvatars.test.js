import { describe, expect, it } from 'vitest';
import { PREWORKED_AVATARS } from './preworkedAvatars';

describe('preworkedAvatars', () => {
  it('defines valid preworked avatars with required fields', () => {
    expect(PREWORKED_AVATARS.length).toBeGreaterThanOrEqual(6);
    const ids = new Set();
    for (const item of PREWORKED_AVATARS) {
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');
      expect(item.name).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.badge).toBeDefined();
      expect(item.src).toBeDefined();
      expect(item.src.startsWith('/avatars/')).toBe(true);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
  });

  it('includes executive chef and clinical dietitian avatars', () => {
    const chef = PREWORKED_AVATARS.find((a) => a.id === 'chef-babatunde');
    expect(chef).toBeDefined();
    expect(chef.title).toContain('Executive Head Chef');

    const drAmina = PREWORKED_AVATARS.find((a) => a.id === 'dr-amina');
    expect(drAmina).toBeDefined();
    expect(drAmina.title).toContain('Clinical Dietitian');
  });
});
