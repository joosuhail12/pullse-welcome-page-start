
import { AppError, NetworkError, ValidationError, AuthError, ServiceUnavailableError, ErrorSeverity } from './errorTypes';

/**
 * Error factory to create standardized error objects
 */
const errorFactory = {
  /**
   * Create a standard application error
   */
  createError: (
    message: string,
    code: string,
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false
  ): AppError => {
    return new AppError(message, code, details, severity, retryable);
  },

  /**
   * Create a network error for API and service communication issues
   */
  createNetworkError: (
    message: string = 'Network request failed',
    details?: Record<string, any>,
    retryable: boolean = true,
    retry?: () => void,
    statusCode?: number
  ): NetworkError => {
    return new NetworkError(message, details, ErrorSeverity.MEDIUM, retryable, retry, statusCode);
  },

  /**
   * Create an API error based on status code
   */
  createApiError: (
    statusCode: number,
    message?: string,
    details?: Record<string, any>
  ) => {
    // Determine error severity and retryability based on status code
    let severity: ErrorSeverity;
    let retryable: boolean;
    
    if (statusCode >= 500) {
      severity = ErrorSeverity.HIGH;
      retryable = true;
    } else if (statusCode === 429) {
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
      message = message || 'Too many requests. Please try again later.';
    } else if (statusCode === 401 || statusCode === 403) {
      severity = ErrorSeverity.HIGH;
      retryable = false;
      message = message || 'Authentication failed or access denied';
    } else {
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
    }
    
    const finalMessage = message || `API error with status code ${statusCode}`;
    const finalDetails = details ? { ...details, statusCode } : { statusCode };
    
    return new NetworkError(finalMessage, finalDetails, severity, retryable);
  },

  /**
   * Create a validation error for form validation failures
   */
  createValidationError: (
    message: string = 'Validation failed',
    fieldErrors?: Record<string, string[]>
  ): ValidationError => {
    return new ValidationError(message, fieldErrors);
  },

  /**
   * Create an authentication error
   */
  createAuthError: (
    message: string = 'Authentication failed',
    details?: Record<string, any>
  ): AuthError => {
    return new AuthError(message, details);
  },

  /**
   * Create an error for when a service is unavailable
   */
  createServiceUnavailableError: (
    service: string,
    details?: Record<string, any>
  ): ServiceUnavailableError => {
    return new ServiceUnavailableError(service, details);
  }
};

export default errorFactory;
