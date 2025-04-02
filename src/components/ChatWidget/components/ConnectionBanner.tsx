
import React from 'react';

interface ConnectionBannerProps {
  isConnected: boolean;
  handleReconnect: () => void;
  realtimeEnabled?: boolean;
}

const ConnectionBanner = ({ isConnected, handleReconnect, realtimeEnabled }: ConnectionBannerProps) => {
  // Only render if realtime is enabled AND connection is lost
  if (!realtimeEnabled || isConnected) return null;
  
  // Memoize the click handler to avoid unnecessary re-renders
  const handleClick = React.useCallback(() => {
    handleReconnect();
  }, [handleReconnect]);
  
  return (
    <div 
      className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs py-1 px-2 text-center cursor-pointer"
      onClick={handleClick}
      role="alert"
      aria-live="assertive"
    >
      Connection lost. Click to reconnect.
    </div>
  );
};

export default React.memo(ConnectionBanner);
