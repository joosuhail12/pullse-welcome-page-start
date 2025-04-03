
/**
 * Error Handler Utility
 * 
 * Provides standardized error handling, logging, and display
 * with built-in security features like sanitization and classification.
 * 
 * SECURITY NOTICE: Error handling must balance providing useful
 * information with preventing sensitive data disclosure.
 */

import { handleError, handleStandardError } from './errors/errorHandlers';
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
  handle: handleError,
  handleStandardError,
  
  // Re-export error factory methods
  ...errorFactory
};

/**
 * Error logging utility - uses structured logging
 */
export const logError = (error: unknown) => {
  logger.error('An error occurred', 'ErrorLogger', getSafeErrorDetails(error));
};
