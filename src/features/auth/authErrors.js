/**
 * Map Auth error codes to plain-language user messages (supports Supabase and fallback codes).
 * @param {string|{ code?: string, message?: string }} error
 * @returns {string} Friendly error message
 */
export function getAuthErrorMessage(error) {
  const code = typeof error === 'string' ? error : error?.code || '';
  const msg = typeof error === 'object' && error?.message ? error.message : '';
  const lowerMsg = msg.toLowerCase();

  if (
    code === 'invalid_credentials' ||
    lowerMsg.includes('invalid login credentials') ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential'
  ) {
    return 'Incorrect email or password. Please try again.';
  }

  if (
    code === 'user_already_exists' ||
    lowerMsg.includes('user already registered') ||
    lowerMsg.includes('email already exists') ||
    code === 'auth/email-already-in-use'
  ) {
    return 'An account with this email already exists. Please log in.';
  }

  if (
    code === 'weak_password' ||
    (lowerMsg.includes('password') && lowerMsg.includes('least')) ||
    code === 'auth/weak-password'
  ) {
    return 'Password must be at least 8 characters long.';
  }

  if (code === 'auth/invalid-email' || lowerMsg.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  if (
    code === 'over_email_send_rate_limit' ||
    code === 'auth/too-many-requests' ||
    lowerMsg.includes('rate limit')
  ) {
    return 'Too many unsuccessful attempts. Please wait a moment and try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet and try again.';
  }

  if (code === 'auth/user-disabled') {
    return 'This account has been disabled. Please contact support.';
  }

  if (msg) {
    return msg;
  }

  return 'An unexpected authentication error occurred. Please try again.';
}
