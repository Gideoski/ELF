/**
 * Utility to map technical Firebase error codes to professional, user-friendly messages.
 */
export const getErrorMessage = (error: any): string => {
  const code = error?.code || '';

  // Auth Errors
  if (code.startsWith('auth/')) {
    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check the spelling or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Access has been temporarily disabled for security. Please try again later.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is currently disabled.';
      default:
        return 'Authentication failed. Please try again or contact support.';
    }
  }

  // Firestore Errors
  if (code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
    return 'You do not have permission to perform this action. Please ensure you are logged in as an authorized administrator.';
  }

  if (code === 'unavailable') {
    return 'The database service is temporarily unavailable. Please try again in a moment.';
  }

  // Default fallback
  return 'An unexpected error occurred. Please refresh the page and try again.';
};
