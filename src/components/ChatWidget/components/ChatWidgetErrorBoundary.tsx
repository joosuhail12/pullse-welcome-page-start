
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { dispatchChatEvent } from '../utils/events';

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
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chat Widget Error:', error, errorInfo);
    
    // Log the error via our event system
    dispatchChatEvent('chat:error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      workspaceId: this.props.workspaceId
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <h3 className="text-red-700 font-medium mb-2">Something went wrong</h3>
          <p className="text-sm text-red-600 mb-4">
            We've encountered an error loading the chat widget. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Refresh Page
          </button>
          
          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-red-100 rounded text-left overflow-auto max-h-40 text-xs">
              <pre>{this.state.error?.toString()}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatWidgetErrorBoundary;
