
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatWidgetConfig } from '../config';
import { useIsMobile } from '@/hooks/use-mobile';

interface LauncherButtonProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
  config: ChatWidgetConfig;
  positionStyles: React.CSSProperties;
}

const LauncherButton: React.FC<LauncherButtonProps> = ({
  isOpen,
  unreadCount,
  onClick,
  config,
  positionStyles
}) => {
  const isMobile = useIsMobile();
  
  // Adjust button size based on screen size
  const buttonSizeClass = isMobile 
    ? "w-10 h-10" 
    : "w-12 h-12 sm:w-14 sm:h-14";
    
  const iconSize = isMobile ? 18 : 24;
  
  return (
    <div className="fixed flex flex-col items-end z-40" style={positionStyles}>
      <Button
        className={`rounded-full ${buttonSizeClass} flex items-center justify-center chat-widget-button relative transition-transform hover:scale-105 shadow-md`}
        style={config.branding?.primaryColor ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor } : {}}
        onClick={onClick}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <MessageSquare size={iconSize} className="text-white" />
        {!isOpen && unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white border-white border-2 animate-pulse text-xs min-w-5 h-5 flex items-center justify-center" 
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default LauncherButton;
