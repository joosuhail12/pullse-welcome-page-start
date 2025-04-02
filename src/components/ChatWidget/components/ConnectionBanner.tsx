
import React from 'react';

interface ConnectionBannerProps {
  isConnected: boolean;
  handleReconnect: () => void;
  realtimeEnabled?: boolean;
}

const ConnectionBanner = ({ isConnected, handleReconnect, realtimeEnabled }: ConnectionBannerProps) => {
  // Simply return null for now to eliminate this component from the rendering tree
  return null;
}

export default React.memo(ConnectionBanner);
