
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ChatWidgetConfig } from '../config';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  positionStyles?: React.CSSProperties;
  config?: ChatWidgetConfig;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  positionStyles,
  config
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Use branding color if available
  const brandColor = config?.branding?.primaryColor || '#6366f1';
  
  const handleRetry = () => {
    if (!resetErrorBoundary) return;
    
    setIsRetrying(true);
    
    // Add a small delay to show the retrying state
    setTimeout(() => {
      resetErrorBoundary();
      setIsRetrying(false);
    }, 1000);
  };
  
  return (
    <div 
      className="fixed bottom-16 sm:bottom-24 right-4 w-[90vw] sm:w-80 md:w-96 h-[300px] max-h-[50vh] rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6 font-sans"
      style={positionStyles}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle 
          className="mb-4 w-12 h-12" 
          style={{ color: brandColor }} 
        />
        
        <h3 className="text-lg font-semibold mb-2">
          Unable to load chat widget
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-[90%]">
          {error?.message || "We're having trouble loading the chat widget at the moment."}
        </p>
        
        {resetErrorBoundary && (
          <button
            onClick={handleRetry}
            className="flex items-center justify-center px-4 py-2 rounded-md text-white disabled:opacity-70"
            style={{ backgroundColor: brandColor }}
            disabled={isRetrying}
          >
            <RefreshCw 
              className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} 
            />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
