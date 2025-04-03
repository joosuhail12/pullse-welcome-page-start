
import React, { useState } from 'react';
import ErrorBoundary from '@/components/ui/error-boundary';
import ErrorFallback from './ErrorFallback';
import useWidgetConfig from '../hooks/useWidgetConfig';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWidgetPosition } from '../hooks/useWidgetPosition';
import { dispatchChatEvent } from '../utils/events';
import { errorHandler } from '@/lib/error-handler';

interface ChatWidgetErrorBoundaryProps {
  children: React.ReactNode;
  workspaceId: string;
}

const ChatWidgetErrorBoundary = ({ children, workspaceId }: ChatWidgetErrorBoundaryProps) => {
  const [error, setError] = useState<Error | null>(null);
  const { config } = useWidgetConfig(workspaceId);
  const isMobile = useIsMobile();
  const { getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  
  const handleError = (err: Error) => {
    errorHandler.handle(err);
    setError(err);
    dispatchChatEvent('error', { error: err.message }, undefined);
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
