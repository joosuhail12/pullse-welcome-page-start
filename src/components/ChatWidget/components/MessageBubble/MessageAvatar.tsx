
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MessageAvatarProps {
  sender?: 'user' | 'system' | 'status' | 'agent' | 'bot';
  avatarUrl?: string;
  isRight?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  isUserMessage?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
}

const MessageAvatar = ({ 
  sender, 
  avatarUrl, 
  isRight = false, 
  status,
  isUserMessage,
  userAvatar,
  agentAvatar,
  agentStatus
}: MessageAvatarProps) => {
  // If the new props are provided, use them instead of the old ones
  const actualIsRight = isUserMessage !== undefined ? isUserMessage : isRight;
  const actualAvatarUrl = isUserMessage ? userAvatar : (agentAvatar || avatarUrl);
  const actualStatus = agentStatus || status;
  const actualSender = sender || (isUserMessage ? 'user' : 'system');
  
  const hasAvatar = !!actualAvatarUrl;
  const initials = actualSender === 'user' ? 'U' : actualSender === 'system' ? 'S' : 'A';
  const avatarClass = actualSender === 'system' ? 'bg-vivid-purple/20 text-vivid-purple' : 'bg-gray-200 text-gray-700';
  
  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  const statusColor = actualStatus ? statusColors[actualStatus] : null;
  
  return (
    <div className={`flex-shrink-0 relative ${actualIsRight ? 'order-last ml-2' : 'mr-2'}`}>
      <Avatar className="h-8 w-8 rounded-full border border-white/10">
        {hasAvatar && <AvatarImage src={actualAvatarUrl} alt={actualSender} className="rounded-full" />}
        <AvatarFallback className={`${avatarClass} rounded-full`}>{initials}</AvatarFallback>
      </Avatar>
      
      {/* Status indicator */}
      {statusColor && (
        <span 
          className={`absolute bottom-0 ${actualIsRight ? 'left-0' : 'right-0'} w-2.5 h-2.5 ${statusColor} rounded-full ring-1 ring-white`}
          aria-label={`Status: ${actualStatus}`}
        />
      )}
    </div>
  );
};

export default MessageAvatar;
