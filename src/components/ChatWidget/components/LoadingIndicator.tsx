
import React from 'react';

interface LoadingIndicatorProps {
  positionStyles?: React.CSSProperties;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ positionStyles }) => {
  return (
    <div 
      className="fixed bottom-16 sm:bottom-24 right-4 w-[90vw] sm:w-80 md:w-96 h-[500px] sm:h-[600px] max-h-[80vh] rounded-lg shadow-lg bg-gradient-to-br from-soft-purple-50 to-soft-purple-100 p-4 font-sans flex items-center justify-center"
      style={positionStyles}
    >
      <div className="flex flex-col items-center">
        <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm sm:text-base text-vivid-purple">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
