
import { toasts } from '@/lib/toast-utils'

// Custom error types for more granular error handling
export class AppError extends Error {
  code?: string
  details?: Record<string, any>

  constructor(
    message: string, 
    code?: string, 
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
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
    toasts.error({
      title: error.code || 'Application Error',
      description: error.message,
    })
    
    // Optional: Log to error tracking service
    console.error('App Error:', error)
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
    details?: Record<string, any>
  ) => new AppError(message, code, details)
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
