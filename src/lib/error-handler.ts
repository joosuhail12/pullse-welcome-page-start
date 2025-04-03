
import { toasts } from '@/lib/toast-utils'
import { getCircuitState } from '@/components/ChatWidget/utils/resilience'

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
    
    // Optional: Log to error tracking service
    console.error(`${error.name} [${error.severity}]:`, error)
    
    // For fatal errors we might want to show a recovery UI
    if (error.severity === ErrorSeverity.FATAL) {
      // Could trigger app-level error boundary or redirect to error page
      console.error('FATAL ERROR - Application may be unstable')
    }
  },

  // Standard JavaScript Error handling
  handleStandardError: (error: Error) => {
    toasts.error({
      title: 'Unexpected Error',
      description: error.message,
    })
    
    console.error('Standard Error:', error)
  },

  // Catch-all for unknown error types
  handleUnknownError: (error: unknown) => {
    toasts.error({
      title: 'Unknown Error',
      description: 'An unexpected error occurred',
    })
    
    console.error('Unknown Error:', error)
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

// Error logging utility
export const logError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(`[ERROR] ${error.name}: ${error.message}`)
    console.error(error.stack)
  } else {
    console.error('[ERROR] An unknown error occurred', error)
  }
}

