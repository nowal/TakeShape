import { TError } from '@/types/dom';
import { notifyError } from '@/utils/notifications';

export const errorAuth = (error: TError) => {
  const errorCode = (error as { code: string }).code;
  if (!errorCode) return null;
  let errorMessage: null | string = null;

  switch (errorCode) {
    case 'invalid-argument':
      errorMessage =
        'Request contains an invalid argument..';
      break;
    case 'auth/email-already-in-use':
      errorMessage =
        'The email address is already in use by another account.';
      break;
    case 'auth/weak-password':
      errorMessage = 'The password is too weak.';
      break;
    case 'auth/invalid-email':
      errorMessage = 'The email address is not valid.';
      break;
    case 'auth/operation-not-allowed':
      errorMessage =
        'Email/password accounts are not enabled.';
      break;
    case 'auth/network-request-failed':
      errorMessage = 'Network error. Please try again.';
      break;
    default:
      errorMessage =
        'An unexpected error occurred. Please try again.';
      break;
  }
  notifyError(errorCode);
  notifyError(errorMessage);

  return errorMessage;
};
