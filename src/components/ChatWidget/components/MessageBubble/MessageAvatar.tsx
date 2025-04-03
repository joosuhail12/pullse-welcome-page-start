
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AgentStatus } from '../../types';

interface MessageAvatarProps {
  sender: 'user' | 'system' | 'status';
  avatarUrl?: string;
  isRight?: boolean;
  status?: AgentStatus;
}

const MessageAvatar = ({ sender, avatarUrl, isRight = false, status }: MessageAvatarProps) => {
  const hasAvatar = !!avatarUrl;
  const initials = sender === 'system' ? 'AI' : 'U';
  const avatarClass = sender === 'system' ? 'bg-vivid-purple/20 text-vivid-purple' : 'bg-gray-200 text-gray-700';
  
  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  const statusColor = status ? statusColors[status] : null;
  
  return (
    <div className={`flex-shrink-0 relative ${isRight ? 'order-last ml-2' : 'mr-2'}`}>
      <Avatar className="h-8 w-8 rounded-full border border-white/10">
        {hasAvatar && <AvatarImage src={avatarUrl} alt={sender} className="rounded-full" />}
        <AvatarFallback className={`${avatarClass} rounded-full`}>{initials}</AvatarFallback>
      </Avatar>
      
      {/* Status indicator */}
      {statusColor && (
        <span 
          className={`absolute bottom-0 ${isRight ? 'left-0' : 'right-0'} w-2.5 h-2.5 ${statusColor} rounded-full ring-1 ring-white`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default MessageAvatar;
