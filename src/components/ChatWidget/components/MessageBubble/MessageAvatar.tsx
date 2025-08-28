
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { AgentStatus } from '../../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatContext } from '../../context/chatContext';

export interface MessageAvatarProps {
  isUserMessage: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  agentStatus?: AgentStatus;
  userName?: string;
  agentName?: string;
  senderType?: string;
  name?: string | null;
}

const MessageAvatar = ({
  isUserMessage,
  userAvatar,
  agentAvatar,
  agentStatus,
  userName = '',
  agentName = '',
  senderType,
  name
}: MessageAvatarProps) => {

  // Determine status indicator color
  const getStatusColor = () => {
    switch (agentStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Get human-readable status text
  const getStatusText = () => {
    switch (agentStatus) {
      case 'online': return 'Agent is online and available';
      case 'away': return 'Agent is away';
      case 'busy': return 'Agent is busy with another conversation';
      case 'offline': return 'Agent is offline';
      default: return 'Status unknown';
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const displayName = name || userName || agentName;
    if (!displayName || displayName.trim() === '') return '';

    return displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get fallback background color based on name
  const getFallbackColor = () => {
    const name = isUserMessage ? userName : agentName;
    const colorOptions = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-amber-100 text-amber-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-rose-100 text-rose-600'
    ];

    if (!name || name.trim() === '') {
      return isUserMessage ?
        'bg-gray-100 text-gray-500' :
        'bg-violet-100 text-violet-600';
    }

    // Deterministic color selection based on name
    const charSum = name
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return colorOptions[charSum % colorOptions.length];
  };

  // Check if we should show initials fallback
  const showInitials = getInitials().length > 0;

  if (senderType === 'system') {
    const { config } = useChatContext();
    const systemAvatar = config?.brandAssets?.launcherIcon;

    return (
      <div className={`relative flex-shrink-0 ${isUserMessage ? 'ml-2' : 'mr-2'}`}>
        <Avatar className="h-8 w-8 border border-gray-200">
          <AvatarImage
            src={systemAvatar}
            alt="System"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Avatar>
      </div>
    );
  }

  return (
    <div className={`relative flex-shrink-0 ${isUserMessage ? 'ml-2' : 'mr-2'}`}>
      <Avatar className="h-8 w-8 border border-gray-200">
        {(isUserMessage ? userAvatar : agentAvatar) && (
          <AvatarImage
            src={isUserMessage ? userAvatar : agentAvatar}
            alt={isUserMessage ? userName || "User" : agentName || "Agent"}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <AvatarFallback className={showInitials ? getFallbackColor() : 'bg-gray-100'}>
          {showInitials ? (
            <span className="text-xs font-medium">{getInitials()}</span>
          ) : (
            senderType === 'customer' ?
              <User size={15} className="text-gray-500" /> :
              <Bot size={15} className="text-gray-500" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Status indicator with tooltip for agent avatar */}
      {!isUserMessage && agentStatus && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusColor()} animate-pulse`}
                aria-label={`Agent is ${agentStatus}`}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {getStatusText()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default MessageAvatar;
