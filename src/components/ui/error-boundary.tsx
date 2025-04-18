
/**
 * Error Boundary Component
 * 
 * Catches and handles React component errors with proper security
 * practices for error display and reporting.
 * 
 * SECURITY NOTICE: Error handling must carefully sanitize all error
 * information to prevent sensitive data exposure in UI.
 */

import React, { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { errorHandler } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
import { getSafeErrorDetails, sanitizeErrorMessage } from '@/lib/error-sanitizer'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * React Error Boundary component that catches errors in the component tree
 * 
 * TODO: Add additional context capture for better debugging
 * TODO: Implement automatic error reporting to monitoring service
 * TODO: Consider adding recovery options for specific error types
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Create sanitized version of error details for logging
    const safeDetails = getSafeErrorDetails(error);
    const sanitizedStack = sanitizeErrorMessage(errorInfo.componentStack);
    
    // Log the error with structured logger and sanitized details
    logger.error(
      `Error caught by boundary: ${sanitizeErrorMessage(error.message)}`, 
      'ErrorBoundary', 
      { 
        ...safeDetails,
        componentStack: sanitizedStack
      }
    );
    
    // Handle the error with our error handler
    errorHandler.handle(error)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    logger.info('Resetting error boundary', 'ErrorBoundary');
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default
      const FallbackComponent = this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Something went wrong
          </h1>
          <p className="text-red-600 mb-4">
            {this.state.error ? sanitizeErrorMessage(this.state.error.message) : 'An unexpected error occurred'}
          </p>
          <button 
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )

      return FallbackComponent
    }

    return this.props.children
  }
}

// Functional component wrapper for easier use with hooks
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>, 
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )
}

export default ErrorBoundary
