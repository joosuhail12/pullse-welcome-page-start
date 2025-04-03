
/**
 * Error Type Definitions
 */

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorDetails {
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  retryable?: boolean;
  retry?: () => void;
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly retryable: boolean;
  public readonly userFacing: boolean;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false,
    userFacing: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.severity = severity;
    this.retryable = retryable;
    this.userFacing = userFacing;
    
    // For better stack traces in modern JS engines
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  public readonly statusCode?: number;
  public readonly retry?: () => void;

  constructor(
    message: string = 'Network request failed',
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = true,
    retry?: () => void,
    statusCode?: number
  ) {
    super(message, 'NETWORK_ERROR', details, severity, retryable, true);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.retry = retry;
  }
}

export class ApiError extends NetworkError {
  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, any>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = statusCode >= 500
  ) {
    super(message, details, severity, retryable, undefined, statusCode);
    this.name = 'ApiError';
  }
}

export class ServiceUnavailableError extends NetworkError {
  constructor(service: string, details?: Record<string, any>) {
    super(
      `Service ${service} is currently unavailable`,
      details,
      ErrorSeverity.HIGH,
      true
    );
    this.name = 'ServiceUnavailableError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', details, ErrorSeverity.HIGH, false);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(
      message,
      'VALIDATION_ERROR',
      { fieldErrors },
      ErrorSeverity.LOW,
      false
    );
    this.name = 'ValidationError';
  }
}
