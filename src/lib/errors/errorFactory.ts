
import { AppError, NetworkError, ValidationError, SecurityError, ErrorSeverity } from './types';

/**
 * Create an application error
 */
export const createAppError = (
  message: string, 
  code: string, 
  options?: {
    details?: Record<string, any>;
    severity?: ErrorSeverity;
    userFacing?: boolean;
    retryable?: boolean;
  }
): AppError => {
  const error = new Error(message) as AppError;
  
  error.name = 'AppError';
  error.code = code;
  error.details = options?.details || {};
  error.timestamp = new Date();
  error.severity = options?.severity || ErrorSeverity.MEDIUM;
  error.userFacing = options?.userFacing !== undefined ? options.userFacing : true;
  error.retryable = options?.retryable !== undefined ? options.retryable : false;
  
  return error;
};

/**
 * Create a network error
 */
export const createNetworkError = (
  message: string,
  options?: {
    statusCode?: number;
    retryable?: boolean;
    retry?: () => void;
    details?: Record<string, any>;
    severity?: ErrorSeverity;
  }
): NetworkError => {
  const error = new Error(message) as NetworkError;
  
  error.name = 'NetworkError';
  error.statusCode = options?.statusCode;
  error.retryable = options?.retryable !== undefined ? options.retryable : true;
  error.retry = options?.retry;
  error.details = options?.details || {};
  error.timestamp = new Date();
  error.severity = options?.severity || ErrorSeverity.MEDIUM;
  
  return error;
};

/**
 * Create a validation error
 */
export const createValidationError = (
  message: string,
  options?: {
    field?: string;
    value?: any;
    constraints?: Record<string, string>;
    details?: Record<string, any>;
    severity?: ErrorSeverity;
  }
): ValidationError => {
  const error = new Error(message) as ValidationError;
  
  error.name = 'ValidationError';
  error.field = options?.field;
  error.value = options?.value;
  error.constraints = options?.constraints;
  error.details = options?.details || {};
  error.timestamp = new Date();
  error.severity = options?.severity || ErrorSeverity.LOW;
  
  return error;
};

/**
 * Create a security error
 */
export const createSecurityError = (
  message: string,
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  options?: {
    mitigationApplied?: boolean;
    details?: Record<string, any>;
  }
): SecurityError => {
  const error = new Error(message) as SecurityError;
  
  error.name = 'SecurityError';
  error.threatLevel = threatLevel;
  error.mitigationApplied = options?.mitigationApplied !== undefined ? options.mitigationApplied : false;
  error.details = options?.details || {};
  error.timestamp = new Date();
  
  // Map threat level to error severity
  switch (threatLevel) {
    case 'LOW':
      error.severity = ErrorSeverity.LOW;
      break;
    case 'MEDIUM':
      error.severity = ErrorSeverity.MEDIUM;
      break;
    case 'HIGH':
      error.severity = ErrorSeverity.HIGH;
      break;
    case 'CRITICAL':
      error.severity = ErrorSeverity.CRITICAL;
      break;
  }
  
  return error;
};

export default {
  createAppError,
  createNetworkError,
  createValidationError,
  createSecurityError
};
