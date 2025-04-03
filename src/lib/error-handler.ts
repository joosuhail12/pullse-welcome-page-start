
/**
 * Error Handler Utility
 * 
 * Provides standardized error handling, logging, and display
 * with built-in security features like sanitization and classification.
 * 
 * SECURITY NOTICE: Error handling must balance providing useful
 * information with preventing sensitive data disclosure.
 */

import { handlers } from './errors/errorHandlers';
import { errorFactory } from './errors/errorFactory';
import { getSafeErrorDetails } from './error-sanitizer';
import { logger } from './logger';
import { 
  AppError, 
  ErrorSeverity, 
  NetworkError, 
  ApiError, 
  ServiceUnavailableError,
  AuthError,
  ValidationError 
} from './errors/errorTypes';

// Re-export error types for convenience
export { 
  AppError, 
  ErrorSeverity, 
  NetworkError, 
  ApiError, 
  ServiceUnavailableError,
  AuthError,
  ValidationError 
};

// Error handler utility
export const errorHandler = {
  // Handle and display generic errors
  handle: (error: unknown) => {
    if (error instanceof NetworkError) {
      return handlers.handleNetworkError(error);
    }
    
    if (error instanceof ApiError) {
      return handlers.handleApiError(error, error.status);
    }
    
    if (error instanceof AppError) {
      return handlers.handleAppError(error);
    }
    
    if (error instanceof Error) {
      return handlers.handleStandardError(error);
    }

    handlers.handleUnknownError(error);
  },

  // Re-export error factory methods
  ...errorFactory
};

/**
 * Error logging utility - uses structured logging
 */
export const logError = (error: unknown) => {
  logger.error('An error occurred', 'ErrorLogger', getSafeErrorDetails(error));
};
