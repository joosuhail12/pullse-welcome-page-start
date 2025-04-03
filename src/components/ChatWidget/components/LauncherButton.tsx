
import React from 'react';
import { X, MessageSquare, WifiOff } from 'lucide-react';
import { ChatWidgetConfig } from '../config';

interface LauncherButtonProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
  config: ChatWidgetConfig;
  positionStyles: React.CSSProperties;
  isOffline?: boolean;
}

const LauncherButton: React.FC<LauncherButtonProps> = ({
  isOpen,
  unreadCount,
  onClick,
  config,
  positionStyles,
  isOffline = false
}) => {
  const buttonSize = config?.appearance?.launcher?.size || 'medium';
  
  const getSizeClasses = () => {
    switch (buttonSize) {
      case 'small':
        return 'h-12 w-12 text-sm';
      case 'large':
        return 'h-16 w-16 text-lg';
      case 'medium':
      default:
        return 'h-14 w-14 text-base';
    }
  };

  const buttonStyle = {
    backgroundColor: config?.branding?.primaryColor || '#8B5CF6',
    ...positionStyles
  };

  return (
    <button
      className={`rounded-full shadow-lg text-white flex items-center justify-center relative ${getSizeClasses()} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vivid-purple transition-all duration-300 hover:shadow-xl transform hover:scale-105`}
      style={buttonStyle}
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        isOffline ? <WifiOff className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />
      )}
      
      {!isOpen && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default LauncherButton;
