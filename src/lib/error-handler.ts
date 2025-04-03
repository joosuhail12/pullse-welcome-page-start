
import { logger } from './logger';
import { toasts } from './toast-utils';
import { createAppError, createNetworkError } from './errors/errorFactory';
import { AppError, NetworkError, ErrorSeverity } from './errors/types';

/**
 * A singleton handler for application errors
 */
class ErrorHandler {
  /**
   * Handle any type of error
   */
  handle(error: unknown): void {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else if (error instanceof NetworkError) {
      this.handleNetworkError(error);
    } else {
      this.handleUnknownError(error);
    }
  }
  
  /**
   * Handle application errors
   */
  private handleAppError(error: AppError): void {
    logger.error(error.message, 'ErrorHandler', error.details);
    
    // Show toast notification for user-facing errors
    if (error.userFacing) {
      toasts.error({
        title: 'Application Error',
        description: error.message,
        duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 5000
      });
    }
  }
  
  /**
   * Handle network errors
   */
  private handleNetworkError(error: NetworkError): void {
    logger.error('Network Error', 'ErrorHandler', {
      message: error.message,
      retryable: error.retryable,
      statusCode: error.statusCode
    });
    
    // Show toast notification for network errors
    toasts.error({
      title: 'Connection Error',
      description: error.message || 'Unable to connect to the server',
      action: error.retryable ? {
        label: 'Retry',
        onClick: error.retry ? error.retry : (() => window.location.reload())
      } : undefined
    });
  }
  
  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    logger.error('Unknown Error', 'ErrorHandler', {
      error
    });
    
    toasts.error({
      title: 'Unexpected Error',
      description: errorMessage
    });
  }
  
  /**
   * Handle a standard error with the option to show a user-facing message
   */
  handleStandardError(error: Error, showToast = true, severity = ErrorSeverity.MEDIUM): void {
    logger.error(error.message, 'ErrorHandler', {
      stack: error.stack
    });
    
    if (showToast) {
      toasts.error({
        title: 'Error',
        description: error.message,
        duration: severity === ErrorSeverity.CRITICAL ? 0 : 5000
      });
    }
  }
}

export const errorHandler = new ErrorHandler();
