
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface BaseError {
  name: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  severity: ErrorSeverity;
}

export interface AppError extends BaseError {
  code: string;
  userFacing: boolean;
  retryable: boolean;
}

export interface NetworkError extends BaseError {
  statusCode?: number;
  retryable: boolean;
  retry?: () => void;
}

export interface ValidationError extends BaseError {
  field?: string;
  value?: any;
  constraints?: Record<string, string>;
}

export interface SecurityError extends BaseError {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationApplied: boolean;
}
