
/**
 * Error Handlers
 * 
 * Provides specialized handlers for different error types
 * with appropriate logging and user notifications.
 * 
 * SECURITY NOTICE: Error handling must balance providing useful
 * information with preventing sensitive data disclosure.
 */

import { toasts } from '../toast-utils';
import { logger } from '../logger';
import { sanitizeErrorMessage, getSafeErrorDetails } from '../error-sanitizer';
import { AppError, ErrorSeverity } from './errorTypes';

/**
 * Specialized handlers for different error categories
 */
export const handlers = {
  // Handle application defined errors
  handleAppError: (error: AppError) => {
    // Different toast variants based on severity
    const variant = error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.FATAL 
      ? 'destructive' 
      : error.severity === ErrorSeverity.MEDIUM 
        ? 'warning' 
        : 'default';
    
    // Always use sanitized message for user-facing toast
    const safeMessage = sanitizeErrorMessage(error.message);
    
    toasts.error({
      title: error.code || 'Application Error',
      description: safeMessage,
      variant
    });
    
    // Log with appropriate severity level using safe details
    logger.error(
      `${error.name} [${error.severity}]: ${safeMessage}`, 
      'ErrorHandler', 
      {
        code: error.code,
        details: error.details ? getSafeErrorDetails(error.details) : undefined,
        stack: error.stack ? sanitizeErrorMessage(error.stack) : undefined
      }
    );
    
    // For fatal errors we might want to show a recovery UI
    if (error.severity === ErrorSeverity.FATAL) {
      // Could trigger app-level error boundary or redirect to error page
      logger.error('FATAL ERROR - Application may be unstable', 'ErrorHandler');
    }
  },

  // Handle standard JavaScript errors
  handleStandardError: (error: Error) => {
    // Sanitize the message for user-facing toast
    const safeMessage = sanitizeErrorMessage(error.message);
    
    toasts.error({
      title: 'Unexpected Error',
      description: safeMessage,
    });
    
    logger.error('Standard Error', 'ErrorHandler', getSafeErrorDetails(error));
  },

  // Handle unknown error types
  handleUnknownError: (error: unknown) => {
    // For unknown errors, use a generic message for the user
    toasts.error({
      title: 'Unknown Error',
      description: 'An unexpected error occurred',
    });
    
    // But log as much safe detail as we can gather
    logger.error('Unknown Error', 'ErrorHandler', getSafeErrorDetails(error));
  },
  
  // Handle network errors
  handleNetworkError: (error: Error) => {
    const safeMessage = sanitizeErrorMessage(error.message);
    
    toasts.error({
      title: 'Network Error',
      description: safeMessage || 'Connection problem detected',
    });
    
    logger.error('Network Error', 'ErrorHandler', getSafeErrorDetails(error));
  },
  
  // Handle API errors
  handleApiError: (error: Error, status?: number) => {
    const safeMessage = sanitizeErrorMessage(error.message);
    
    // Customize message based on status code
    let title = 'API Error';
    if (status === 401) title = 'Authentication Error';
    else if (status === 403) title = 'Access Denied';
    else if (status === 404) title = 'Resource Not Found';
    else if (status === 429) title = 'Too Many Requests';
    else if (status >= 500) title = 'Server Error';
    
    toasts.error({
      title,
      description: safeMessage,
    });
    
    logger.error(`API Error (${status})`, 'ErrorHandler', getSafeErrorDetails(error));
  }
};
