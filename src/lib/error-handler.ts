/**
 * Error Handler Utility
 * 
 * Provides standardized error handling, logging, and display
 * with built-in security features like sanitization and classification.
 * 
 * SECURITY NOTICE: Error handling must balance providing useful
 * information with preventing sensitive data disclosure.
 */

import { toasts } from '@/lib/toast-utils'
import { getCircuitState } from '@/components/ChatWidget/utils/resilience'
import { logger } from '@/lib/logger'
import { sanitizeErrorMessage, getSafeErrorDetails } from '@/lib/error-sanitizer'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',      // Non-critical errors, user can continue
  MEDIUM = 'medium', // Important but not blocking functionality
  HIGH = 'high',    // Critical errors that prevent core functionality
  FATAL = 'fatal'   // Application cannot function
}

// Custom error types for more granular error handling
export class AppError extends Error {
  code?: string
  details?: Record<string, any>
  severity: ErrorSeverity
  retryable: boolean

  constructor(
    message: string, 
    code?: string, 
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ) {
    // Sanitize the error message before creating the Error instance
    super(sanitizeErrorMessage(message));
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.severity = severity
    this.retryable = retryable
  }
}

// Network related errors
/**
 * Network error with retry capabilities
 * 
 * TODO: Add network condition detection
 * TODO: Implement progressive backoff for retries
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network connection issue',
    details?: Record<string, any>
  ) {
    super(sanitizeErrorMessage(message), 'ERR_NETWORK', details, ErrorSeverity.MEDIUM, true)
    this.name = 'NetworkError'
  }
}

// API related errors
/**
 * API error with status code information
 * 
 * TODO: Add correlation ID tracking
 * TODO: Implement API version conflict detection
 */
export class ApiError extends AppError {
  status?: number
  
  constructor(
    message: string,
    status?: number,
    details?: Record<string, any>
  ) {
    // API errors are often retryable
    const retryable = !status || status >= 500 || status === 429
    const severity = status && status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
    
    super(sanitizeErrorMessage(message), `ERR_API_${status || 'UNKNOWN'}`, details, severity, retryable)
    this.name = 'ApiError'
    this.status = status
  }
}

// Service unavailable error (circuit breaker open)
/**
 * Service unavailable error with circuit breaker information
 * 
 * TODO: Add degraded mode capabilities
 * TODO: Implement service health monitoring
 */
export class ServiceUnavailableError extends AppError {
  serviceName: string
  
  constructor(serviceName: string) {
    super(
      sanitizeErrorMessage(`Service ${serviceName} is currently unavailable`),
      'ERR_SERVICE_UNAVAILABLE',
      { serviceName, circuitState: getCircuitState(`${serviceName}`) },
      ErrorSeverity.HIGH,
      false // Not immediately retryable when circuit is open
    )
    this.name = 'ServiceUnavailableError'
    this.serviceName = serviceName
  }
}

// Error handler utility
/**
 * Centralized error handler with sanitization and logging
 * 
 * TODO: Add error aggregation for similar errors
 * TODO: Implement user feedback collection for critical errors
 * TODO: Add automatic recovery suggestions based on error type
 */
export const errorHandler = {
  // Handle and display generic errors
  handle: (error: unknown) => {
    if (error instanceof AppError) {
      return errorHandler.handleAppError(error)
    }
    
    if (error instanceof Error) {
      return errorHandler.handleStandardError(error)
    }

    errorHandler.handleUnknownError(error)
  },

  // Specific handling for application-defined errors
  handleAppError: (error: AppError) => {
    // Different toast variants based on severity
    const variant = error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.FATAL 
      ? 'destructive' 
      : error.severity === ErrorSeverity.MEDIUM 
        ? 'warning' 
        : 'default'
    
    // Always use sanitized message for user-facing toast
    const safeMessage = sanitizeErrorMessage(error.message);
    
    toasts.error({
      title: error.code || 'Application Error',
      description: safeMessage,
    })
    
    // Log with appropriate severity level using safe details
    logger.error(
      `${error.name} [${error.severity}]: ${safeMessage}`, 
      'ErrorHandler', 
      {
        code: error.code,
        details: error.details ? getSafeErrorDetails(error.details) : undefined,
        stack: error.stack ? sanitizeErrorMessage(error.stack) : undefined
      }
    )
    
    // For fatal errors we might want to show a recovery UI
    if (error.severity === ErrorSeverity.FATAL) {
      // Could trigger app-level error boundary or redirect to error page
      logger.error('FATAL ERROR - Application may be unstable', 'ErrorHandler')
    }
  },

  // Standard JavaScript Error handling
  handleStandardError: (error: Error) => {
    // Sanitize the message for user-facing toast
    const safeMessage = sanitizeErrorMessage(error.message);
    
    toasts.error({
      title: 'Unexpected Error',
      description: safeMessage,
    })
    
    logger.error('Standard Error', 'ErrorHandler', getSafeErrorDetails(error))
  },

  // Catch-all for unknown error types
  handleUnknownError: (error: unknown) => {
    // For unknown errors, use a generic message for the user
    toasts.error({
      title: 'Unknown Error',
      description: 'An unexpected error occurred',
    })
    
    // But log as much safe detail as we can gather
    logger.error('Unknown Error', 'ErrorHandler', getSafeErrorDetails(error))
  },

  // Create a custom application error
  createError: (
    message: string, 
    code: string, 
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ) => new AppError(sanitizeErrorMessage(message), code, details, severity, retryable),
  
  // Create network error
  createNetworkError: (
    message?: string,
    details?: Record<string, any>
  ) => new NetworkError(message, details),
  
  // Create API error
  createApiError: (
    message: string,
    status?: number,
    details?: Record<string, any>
  ) => new ApiError(message, status, details),
  
  // Create service unavailable error
  createServiceUnavailableError: (
    serviceName: string
  ) => new ServiceUnavailableError(serviceName)
}

/**
 * Error logging utility - replace with structured logging
 * 
 * TODO: Implement structured logging format
 * TODO: Add error categorization for reporting
 */
export const logError = (error: unknown) => {
  logger.error('An error occurred', 'ErrorLogger', getSafeErrorDetails(error))
}
