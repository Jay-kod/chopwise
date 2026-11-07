import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from './authErrors';

describe('getAuthErrorMessage', () => {
  it('maps known Firebase auth error codes to friendly text', () => {
    expect(getAuthErrorMessage('auth/email-already-in-use')).toContain('already exists');
    expect(getAuthErrorMessage('auth/invalid-email')).toContain('valid email');
    expect(getAuthErrorMessage('auth/invalid-credential')).toContain('Incorrect email or password');
    expect(getAuthErrorMessage('auth/wrong-password')).toContain('Incorrect email or password');
    expect(getAuthErrorMessage('auth/weak-password')).toContain('at least 8 characters');
    expect(getAuthErrorMessage('auth/network-request-failed')).toContain('Network connection failed');
    expect(getAuthErrorMessage('auth/too-many-requests')).toContain('Too many unsuccessful attempts');
  });

  it('handles error objects with code property', () => {
    expect(
      getAuthErrorMessage({ code: 'auth/user-not-found', message: 'Firebase raw error' })
    ).toContain('Incorrect email or password');
  });

  it('falls back to error.message or generic message for unknown errors', () => {
    expect(getAuthErrorMessage({ message: 'Custom error' })).toBe('Custom error');
    expect(getAuthErrorMessage('unknown/code')).toContain('unexpected authentication error');
  });
});

