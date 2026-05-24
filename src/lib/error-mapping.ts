/**
 * Utility to map technical Firebase error codes to professional, user-friendly messages.
 * This ensures users see standard industry error messages rather than technical logs.
 */
export const getErrorMessage = (error: any): string => {
  // Extract the code from the error object
  const code = error?.code || error?.message || '';

  // Auth Errors - Professional standard messages
  if (code.includes('auth/')) {
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (code.includes('email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code.includes('weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code.includes('too-many-requests')) {
      return 'Too many failed login attempts. Please try again later for security reasons.';
    }
    if (code.includes('network-request-failed')) {
      return 'A network error occurred. Please check your internet connection.';
    }
    return 'Authentication failed. Please try again or contact the administrator.';
  }

  // Firestore / Permission Errors
  if (code.includes('permission-denied') || code.includes('insufficient-permissions')) {
    return 'Access denied. You do not have the required permissions to perform this action.';
  }

  if (code.includes('unavailable')) {
    return 'The service is temporarily unavailable. Please try again in a moment.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please refresh the page and try again.';
};
