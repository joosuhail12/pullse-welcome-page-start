
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { dispatchChatEvent } from '../utils/events';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  workspaceId: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ChatWidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    logger.error('Chat widget error caught:', 'ChatWidgetErrorBoundary', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Send error to any analytics or monitoring system
    dispatchChatEvent('chat:error' as any, {
      error: error.toString(),
      message: 'An error occurred in the chat widget',
      workspaceId: this.props.workspaceId,
      timestamp: new Date()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto mt-8">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We apologize for the inconvenience. The chat widget encountered an error.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-vivid-purple text-white rounded-md hover:bg-vivid-purple-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatWidgetErrorBoundary;
