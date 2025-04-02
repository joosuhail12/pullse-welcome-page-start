
import React from 'react';

interface ConnectionBannerProps {
  isConnected: boolean;
  handleReconnect: () => void;
  realtimeEnabled?: boolean;
}

const ConnectionBanner = ({ isConnected, handleReconnect, realtimeEnabled }: ConnectionBannerProps) => {
  if (!realtimeEnabled || isConnected) return null;
  
  return (
    <div 
      className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs py-1 px-2 text-center cursor-pointer"
      onClick={handleReconnect}
      role="alert"
      aria-live="assertive"
    >
      Connection lost. Click to reconnect.
    </div>
  );
};

export default ConnectionBanner;
