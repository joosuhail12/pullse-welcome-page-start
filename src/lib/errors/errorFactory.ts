
/**
 * Error Factory
 * 
 * Provides factory functions for creating different types of errors
 * with consistent structures and metadata.
 * 
 * SECURITY NOTICE: Error factories should sanitize error messages
 * before creating error instances.
 */

import { 
  AppError, 
  ErrorSeverity, 
  NetworkError, 
  ApiError, 
  ServiceUnavailableError,
  AuthError,
  ValidationError
} from './errorTypes';
import { sanitizeErrorMessage } from '../error-sanitizer';
import { getCircuitState } from '@/components/ChatWidget/utils/resilience';

/**
 * Factory functions to create standard application errors
 */
export const errorFactory = {
  // Create a generic application error
  createError: (
    message: string, 
    code: string, 
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ): AppError => {
    return new AppError(
      sanitizeErrorMessage(message), 
      code, 
      details, 
      severity, 
      retryable
    )
  },
  
  // Create network error
  createNetworkError: (
    message?: string,
    details?: Record<string, any>
  ): NetworkError => {
    return new NetworkError(
      message ? sanitizeErrorMessage(message) : undefined, 
      details
    )
  },
  
  // Create API error
  createApiError: (
    message: string,
    status?: number,
    details?: Record<string, any>
  ): ApiError => {
    return new ApiError(
      sanitizeErrorMessage(message), 
      status, 
      details
    )
  },
  
  // Create service unavailable error
  createServiceUnavailableError: (
    serviceName: string
  ): ServiceUnavailableError => {
    const error = new ServiceUnavailableError(
      sanitizeErrorMessage(serviceName)
    )
    
    // Add circuit state if available
    error.details = { 
      ...error.details,
      circuitState: getCircuitState(serviceName) 
    }
    
    return error
  },

  // Create authentication error
  createAuthError: (
    message: string = 'Authentication failed',
    code: string = 'ERR_AUTH',
    details?: Record<string, any>
  ): AuthError => {
    return new AuthError(
      sanitizeErrorMessage(message),
      code,
      details
    )
  },

  // Create validation error
  createValidationError: (
    message: string = 'Validation failed',
    details?: Record<string, any>
  ): ValidationError => {
    return new ValidationError(
      sanitizeErrorMessage(message),
      details
    )
  }
}
