
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatWidgetConfig } from '../config';
import { useIsMobile } from '@/hooks/use-mobile';
import { AgentStatus } from '../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatContext } from '../context/chatContext';
import { useWidgetPosition } from '../hooks/useWidgetPosition';

interface LauncherButtonProps {
  unreadCount: number;
  agentStatus?: AgentStatus;
  isDemo?: boolean;
}

const LauncherButton: React.FC<LauncherButtonProps> = ({
  unreadCount,
  agentStatus = 'online',
  isDemo = false
}) => {
  const isMobile = useIsMobile();
  const { config, isOpen, setIsOpen } = useChatContext();
  const { getLauncherPositionStyles } = useWidgetPosition(config, isMobile);
  const [showTooltip, setShowTooltip] = useState(false);
  const showPresence = config?.interfaceSettings?.showAgentPresence;
  // Adjust button size based on screen size
  const buttonSizeClass = isMobile
    ? "w-10 h-10"
    : "w-12 h-12 sm:w-14 sm:h-14";

  const iconSize = isMobile ? 18 : 24;

  // Get appropriate status indicator color
  const getStatusColor = () => {
    if (!config?.interfaceSettings?.showAgentPresence) {
      return 'bg-gray-400';
    }

    switch (agentStatus) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-amber-500';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Get human-readable status text for tooltip
  const getStatusText = () => {
    switch (agentStatus) {
      case 'online': return 'Agents are online';
      case 'busy': return 'Agents are busy';
      case 'away': return 'Agents are away';
      case 'offline': return 'Agents are offline';
      default: return 'Status unknown';
    }
  };

  return (
    <div className={`flex flex-col z-40 items-end ${!isDemo ? "fixed" : ""}`} style={getLauncherPositionStyles}>
      {/* Status indicator tooltip that shows on hover */}
      {!isOpen && showTooltip && showPresence && (
        <div className="mb-2 px-3 py-1.5 bg-white rounded-lg shadow-md text-xs flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor()} mr-1.5 animate-pulse`}></span>
          <span>{getStatusText()}</span>
        </div>
      )}

      <TooltipProvider>
        <Tooltip open={showTooltip && !isOpen && showPresence}>
          <TooltipTrigger asChild>
            <Button
              className={`rounded-full ${buttonSizeClass} flex items-center justify-center chat-widget-button relative transition-transform hover:scale-105 shadow-md`}
              style={config.colors?.primaryColor ? { backgroundColor: config.colors.primaryColor, borderColor: config.colors.primaryColor } : {}}
              onClick={() => setIsOpen(!isOpen)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label={isOpen ? "Close chat" : "Open chat"}
            >
              {
                config.brandAssets.launcherIcon && (
                  <img src={config.brandAssets.launcherIcon} alt="Launcher icon" width={iconSize} height={iconSize} />
                )
              }
              {
                !config.brandAssets.launcherIcon && (
                  <MessageSquare size={iconSize} className="text-white" />
                )
              }
              {!isOpen && unreadCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 bg-red-500 text-white border-white border-2 animate-pulse text-xs min-w-5 h-5 flex items-center justify-center"
                  variant="destructive"
                >
                  {unreadCount}
                </Badge>
              )}

              {/* Status indicator dot on the button */}
              {!isOpen && showPresence && (
                <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${getStatusColor()}`}>
                  <span className={`absolute inset-0 rounded-full ${getStatusColor()} animate-ping opacity-75`}></span>
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {
            showPresence && (<TooltipContent side="left" className="p-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor()}`}></span>
                <span>{getStatusText()}</span>
              </div>
            </TooltipContent>)
          }
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LauncherButton;
