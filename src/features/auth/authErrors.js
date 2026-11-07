/**
 * Map Firebase Auth error codes to plain-language user messages.
 * @param {string|{ code?: string, message?: string }} error
 * @returns {string} Friendly error message
 */
export function getAuthErrorMessage(error) {
  const code = typeof error === 'string' ? error : error?.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/weak-password':
      return 'Password must be at least 8 characters long.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed. Please try again.';
    default:
      return typeof error === 'object' && error?.message
        ? error.message
        : 'An unexpected authentication error occurred. Please try again.';
  }
}
