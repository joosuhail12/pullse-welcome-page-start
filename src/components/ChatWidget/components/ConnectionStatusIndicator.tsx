
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudOff, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '../utils/reconnectionManager';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
}

const ConnectionStatusIndicator = ({
  status,
  className,
  showLabel = false,
  variant = 'default'
}: ConnectionStatusIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(status !== ConnectionStatus.CONNECTED);
  const [fadeOut, setFadeOut] = useState(false);
  
  // Auto-hide the indicator after connection is restored
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED) {
      // Show briefly when connected, then fade out
      setIsVisible(true);
      setFadeOut(false);
      
      const hideTimer = setTimeout(() => {
        setFadeOut(true);
        
        const removeTimer = setTimeout(() => {
          setIsVisible(false);
        }, 1000); // Wait for fade animation to complete
        
        return () => clearTimeout(removeTimer);
      }, 3000);
      
      return () => clearTimeout(hideTimer);
    } else {
      setIsVisible(true);
      setFadeOut(false);
    }
  }, [status]);

  if (!isVisible) return null;
  
  // Determine icon and colors based on connection status
  const getStatusDetails = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return {
          icon: <Check className="h-4 w-4" />,
          label: 'Connected',
          color: 'text-green-500 bg-green-50 border-green-200'
        };
      case ConnectionStatus.CONNECTING:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: 'Connecting...',
          color: 'text-amber-500 bg-amber-50 border-amber-200'
        };
      case ConnectionStatus.SUSPENDED:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: 'Connection limited',
          color: 'text-amber-500 bg-amber-50 border-amber-200'
        };
      case ConnectionStatus.FAILED:
        return {
          icon: <CloudOff className="h-4 w-4" />,
          label: 'Connection failed',
          color: 'text-red-500 bg-red-50 border-red-200'
        };
      case ConnectionStatus.DISCONNECTED:
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          label: 'Offline',
          color: 'text-gray-500 bg-gray-50 border-gray-200'
        };
    }
  };
  
  const { icon, label, color } = getStatusDetails();

  if (variant === 'icon-only') {
    return (
      <div 
        className={cn(
          "flex items-center justify-center rounded-full p-1",
          color,
          fadeOut && "opacity-0 transition-opacity duration-1000",
          className
        )}
      >
        {icon}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full border",
          color,
          fadeOut && "opacity-0 transition-opacity duration-1000",
          className
        )}
      >
        {icon}
        {showLabel && <span className="text-xs font-medium">{label}</span>}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md border",
        color,
        fadeOut && "opacity-0 transition-opacity duration-1000",
        className
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default ConnectionStatusIndicator;
