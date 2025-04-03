
import { toasts } from '@/lib/toast-utils'
import { getCircuitState } from '@/components/ChatWidget/utils/resilience'
import { logger } from '@/lib/logger'

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
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.severity = severity
    this.retryable = retryable
  }
}

// Network related errors
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network connection issue',
    details?: Record<string, any>
  ) {
    super(message, 'ERR_NETWORK', details, ErrorSeverity.MEDIUM, true)
    this.name = 'NetworkError'
  }
}

// API related errors
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
    
    super(message, `ERR_API_${status || 'UNKNOWN'}`, details, severity, retryable)
    this.name = 'ApiError'
    this.status = status
  }
}

// Service unavailable error (circuit breaker open)
export class ServiceUnavailableError extends AppError {
  serviceName: string
  
  constructor(serviceName: string) {
    super(
      `Service ${serviceName} is currently unavailable`,
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
    
    toasts.error({
      title: error.code || 'Application Error',
      description: error.message,
    })
    
    // Log with appropriate severity level
    logger.error(
      `${error.name} [${error.severity}]: ${error.message}`, 
      'ErrorHandler', 
      {
        code: error.code,
        details: error.details,
        stack: error.stack
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
    toasts.error({
      title: 'Unexpected Error',
      description: error.message,
    })
    
    logger.error('Standard Error', 'ErrorHandler', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  },

  // Catch-all for unknown error types
  handleUnknownError: (error: unknown) => {
    toasts.error({
      title: 'Unknown Error',
      description: 'An unexpected error occurred',
    })
    
    logger.error('Unknown Error', 'ErrorHandler', { error })
  },

  // Create a custom application error
  createError: (
    message: string, 
    code: string, 
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ) => new AppError(message, code, details, severity, retryable),
  
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

// Error logging utility - replace with structured logging
export const logError = (error: unknown) => {
  if (error instanceof Error) {
    logger.error(`${error.name}: ${error.message}`, 'ErrorLogger', { 
      stack: error.stack 
    })
  } else {
    logger.error('An unknown error occurred', 'ErrorLogger', { error })
  }
}
