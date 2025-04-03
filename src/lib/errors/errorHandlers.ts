
import { logger } from '../logger';
import { toasts } from '../toast-utils';
import { AppError, NetworkError, ErrorSeverity } from './errorTypes';

/**
 * Generic error handler
 * @param error The error to handle
 */
export function handleError(error: unknown): void {
  if (error instanceof AppError) {
    handleAppError(error);
  } else if (error instanceof NetworkError) {
    handleNetworkError(error);
  } else {
    handleUnknownError(error);
  }
}

/**
 * Handle application errors
 */
function handleAppError(error: AppError): void {
  logger.error(error.message, 'ErrorHandler', error.details);
  
  // Show toast notification for user-facing errors
  if (error.userFacing !== false) {
    toasts.error({
      title: 'Application Error',
      description: error.message,
      duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 5000
    });
  }
}

/**
 * Handle network errors
 */
function handleNetworkError(error: NetworkError): void {
  logger.error('Network Error', 'ErrorHandler', {
    message: error.message,
    retryable: error.retryable,
    statusCode: error.statusCode || 0
  });
  
  // Show toast notification for network errors
  toasts.error({
    title: 'Connection Error',
    description: error.message || 'Unable to connect to the server',
    action: error.retryable ? {
      label: 'Retry',
      onClick: error.retry || (() => window.location.reload())
    } : undefined
  });
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  
  logger.error('Unknown Error', 'ErrorHandler', { error });
  
  toasts.error({
    title: 'Unexpected Error',
    description: errorMessage
  });
}

/**
 * Handle a standard error with the option to show a user-facing message
 */
export function handleStandardError(
  error: Error, 
  showToast: boolean = true,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): void {
  logger.error(error.message, 'ErrorHandler', { stack: error.stack });
  
  if (showToast) {
    toasts.error({
      title: 'Error',
      description: error.message,
      duration: severity === ErrorSeverity.CRITICAL ? 0 : 5000
    });
  }
}
