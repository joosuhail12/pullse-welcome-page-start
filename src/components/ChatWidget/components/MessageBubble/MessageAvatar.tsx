
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { AgentStatus } from '../../types';

interface MessageAvatarProps {
  sender?: 'user' | 'system' | 'status';
  avatarUrl?: string;
  isUserMessage?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  isRight?: boolean;
  status?: AgentStatus;
}

const MessageAvatar = ({ 
  sender, 
  avatarUrl, 
  isUserMessage, 
  userAvatar,
  agentAvatar,
  isRight = false, 
  status 
}: MessageAvatarProps) => {
  // Support both old and new API
  const effectiveSender = sender || (isUserMessage ? 'user' : 'system');
  const effectiveAvatarUrl = avatarUrl || (effectiveSender === 'user' ? userAvatar : agentAvatar);
  
  const hasAvatar = !!effectiveAvatarUrl;
  const initials = effectiveSender === 'system' ? 'AI' : 'U';
  const avatarClass = effectiveSender === 'system' ? 'bg-vivid-purple/20 text-vivid-purple' : 'bg-gray-200 text-gray-700';
  
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
        {hasAvatar && <AvatarImage src={effectiveAvatarUrl} alt={effectiveSender} className="rounded-full" />}
        <AvatarFallback className={`${avatarClass} rounded-full`}>
          <User size={14} />
        </AvatarFallback>
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
