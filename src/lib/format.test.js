import { describe, it, expect } from 'vitest';
import { formatNaira } from './format';

describe('formatNaira', () => {
  it('formats positive integers with commas and the naira symbol', () => {
    expect(formatNaira(1200)).toBe('₦1,200');
    expect(formatNaira(1000000)).toBe('₦1,000,000');
  });

  it('handles zero, null, and NaN', () => {
    expect(formatNaira(0)).toBe('₦0');
    expect(formatNaira(null)).toBe('₦0');
    expect(formatNaira(undefined)).toBe('₦0');
    expect(formatNaira(NaN)).toBe('₦0');
  });

  it('rounds decimal values', () => {
    expect(formatNaira(1234.56)).toBe('₦1,235');
    expect(formatNaira(1234.4)).toBe('₦1,234');
  });
});

