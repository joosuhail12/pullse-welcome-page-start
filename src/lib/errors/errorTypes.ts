
/**
 * Error Types
 * 
 * Defines standard error classes for different types of application errors
 * with appropriate metadata and classification.
 * 
 * SECURITY NOTICE: Error classes should not expose sensitive information
 * in their default state.
 */

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',      // Non-critical errors, user can continue
  MEDIUM = 'medium', // Important but not blocking functionality
  HIGH = 'high',    // Critical errors that prevent core functionality
  FATAL = 'fatal'   // Application cannot function
}

// Base application error with metadata
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
    super(message);
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
      { serviceName },
      ErrorSeverity.HIGH,
      false // Not immediately retryable when circuit is open
    )
    this.name = 'ServiceUnavailableError'
    this.serviceName = serviceName
  }
}

// Authentication errors
export class AuthError extends AppError {
  constructor(
    message: string = 'Authentication failed', 
    code: string = 'ERR_AUTH',
    details?: Record<string, any>
  ) {
    super(message, code, details, ErrorSeverity.HIGH, false)
    this.name = 'AuthError'
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed', 
    details?: Record<string, any>
  ) {
    super(message, 'ERR_VALIDATION', details, ErrorSeverity.MEDIUM, false)
    this.name = 'ValidationError'
  }
}
