
import { toast } from "@/components/ui/use-toast";
import { logger } from "./logger";

// Error types
export type AppError = {
  code: string;
  message: string;
  userFacing: boolean;
  retryable: boolean;
  name: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
};

export type NetworkError = {
  status?: number;
  retryable: boolean;
  name: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

class ErrorHandler {
  // Handle application-specific errors
  handleAppError(error: AppError): void {
    logger.error(error.message, 'ErrorHandler', { 
      code: error.code,
      details: error.details
    });
    
    if (error.userFacing) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }
  
  // Handle network errors
  handleNetworkError(error: NetworkError): void {
    logger.error(`Network error: ${error.message}`, 'ErrorHandler', { 
      status: error.status,
      retryable: error.retryable
    });
    
    toast({
      title: "Connection Error",
      description: error.message,
      variant: "destructive",
    });
  }
  
  // Handle generic errors
  handleStandardError(error: Error): void {
    logger.error(error.message, 'ErrorHandler', { stack: error.stack });
    
    // Only show generic errors in development
    if (import.meta.env.DEV) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }
  
  // Main entry point for error handling
  handle(error: unknown): void {
    if (error && typeof error === 'object') {
      // Check if it's an AppError
      if ('userFacing' in error && 'code' in error) {
        this.handleAppError(error as AppError);
        return;
      }
      
      // Check if it's a NetworkError
      if ('status' in error) {
        this.handleNetworkError(error as NetworkError);
        return;
      }
    }
    
    // Default handling for standard Error objects
    if (error instanceof Error) {
      this.handleStandardError(error);
      return;
    }
    
    // Fallback for unknown error types
    logger.error('Unknown error', 'ErrorHandler', { error });
    
    if (import.meta.env.DEV) {
      toast({
        title: "Unknown Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }
}

export const errorHandler = new ErrorHandler();
