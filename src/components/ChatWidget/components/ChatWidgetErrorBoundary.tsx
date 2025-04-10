
import React, { useState } from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import ErrorFallback from './ErrorFallback';
import useWidgetConfig from '../hooks/useWidgetConfig';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWidgetPosition } from '../hooks/useWidgetPosition';
import { dispatchChatEvent } from '../utils/events';
import { errorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';

interface ChatWidgetErrorBoundaryProps {
  children: React.ReactNode;
  workspaceId: string;
}

const ChatWidgetErrorBoundary = ({ children, workspaceId }: ChatWidgetErrorBoundaryProps) => {
  const [error, setError] = useState<Error | null>(null);
  const { config } = useWidgetConfig();
  const isMobile = useIsMobile();
  const { getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  
  const handleError = (err: Error) => {
    // Use error handler for consistent error processing
    errorHandler.handle(err);
    setError(err);
    
    // Use sanitized error message for logging
    const safeErrorMessage = sanitizeErrorMessage(err.message);
    
    logger.error(
      'Chat widget encountered an error', 
      'ChatWidgetErrorBoundary', 
      { error: safeErrorMessage, workspaceId }
    );
    
    // Dispatch event with sanitized error message
    dispatchChatEvent('chat:error', { error: safeErrorMessage }, config);
  };
  
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={
        <ErrorFallback 
          error={error} 
          positionStyles={getWidgetContainerPositionStyles}
          config={config}
          resetErrorBoundary={() => window.location.reload()} 
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ChatWidgetErrorBoundary;
