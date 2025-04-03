
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatWidgetConfig } from '../config';

interface EnhancedLoadingIndicatorProps {
  positionStyles?: React.CSSProperties;
  config?: ChatWidgetConfig;
}

const EnhancedLoadingIndicator: React.FC<EnhancedLoadingIndicatorProps> = ({ 
  positionStyles, 
  config 
}) => {
  // Use branding color if available
  const brandColor = config?.branding?.primaryColor || '#6366f1';
  
  return (
    <div 
      className="fixed bottom-16 sm:bottom-24 right-4 w-[90vw] sm:w-80 md:w-96 h-[500px] sm:h-[600px] max-h-[80vh] rounded-lg shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 font-sans"
      style={{
        ...positionStyles,
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" style={{ backgroundColor: `${brandColor}20` }} />
          <Skeleton className="h-4 w-24" style={{ backgroundColor: `${brandColor}20` }} />
        </div>
        <Skeleton className="h-6 w-6 rounded" style={{ backgroundColor: `${brandColor}20` }} />
      </div>
      
      {/* Chat content skeleton */}
      <div className="my-4 space-y-4 overflow-hidden">
        {/* Message bubbles */}
        <div className="flex justify-start">
          <div className="flex items-start space-x-2 max-w-[80%]">
            <Skeleton className="w-6 h-6 rounded-full mt-1" style={{ backgroundColor: `${brandColor}20` }} />
            <Skeleton className="h-16 w-48 rounded-lg" style={{ backgroundColor: `${brandColor}20` }} />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-lg ml-auto" style={{ backgroundColor: `${brandColor}20` }} />
        </div>
        
        <div className="flex justify-start">
          <div className="flex items-start space-x-2 max-w-[80%]">
            <Skeleton className="w-6 h-6 rounded-full mt-1" style={{ backgroundColor: `${brandColor}20` }} />
            <Skeleton className="h-24 w-56 rounded-lg" style={{ backgroundColor: `${brandColor}20` }} />
          </div>
        </div>
      </div>
      
      {/* Input area skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 flex-grow rounded-full" style={{ backgroundColor: `${brandColor}20` }} />
          <Skeleton className="h-10 w-10 rounded-full" style={{ backgroundColor: `${brandColor}20` }} />
        </div>
      </div>
      
      {/* Simple loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] rounded-lg">
        <div className="flex flex-col items-center">
          <div 
            className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: `${brandColor}`, borderTopColor: 'transparent' }}
          ></div>
          <p className="text-sm sm:text-base" style={{ color: brandColor }}>
            Loading chat widget...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingIndicator;
