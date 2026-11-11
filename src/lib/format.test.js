import { describe, it, expect } from 'vitest';
import { formatNaira, formatCurrentDate, getDayOfWeekIndex } from './format';

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

describe('getDayOfWeekIndex', () => {
  it('returns 0 for Monday and 6 for Sunday', () => {
    const monday = new Date('2026-11-09T12:00:00Z');
    expect(getDayOfWeekIndex(monday)).toBe(0);

    const friday = new Date('2026-11-13T12:00:00Z');
    expect(getDayOfWeekIndex(friday)).toBe(4);

    const sunday = new Date('2026-11-15T12:00:00Z');
    expect(getDayOfWeekIndex(sunday)).toBe(6);
  });
});

describe('formatCurrentDate', () => {
  it('formats a date with short weekday, day, month and year', () => {
    const date = new Date('2026-11-09T12:00:00Z');
    const formatted = formatCurrentDate(date);
    expect(formatted).toContain('Nov');
    expect(formatted).toContain('2026');
  });

  it('handles invalid input gracefully', () => {
    expect(formatCurrentDate('invalid')).toBe('');
  });
});
