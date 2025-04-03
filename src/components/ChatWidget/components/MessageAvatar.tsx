
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { AgentStatus } from '../types';

interface MessageAvatarProps {
  isUserMessage: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  agentStatus?: AgentStatus;
}

const MessageAvatar: React.FC<MessageAvatarProps> = React.memo(({ 
  isUserMessage, 
  userAvatar, 
  agentAvatar,
  agentStatus = 'online'
}) => {
  const statusColorMap = {
    'online': 'bg-green-500',
    'away': 'bg-yellow-500',
    'offline': 'bg-gray-400',
    'busy': 'bg-red-500'
  };

  return (
    <div className="relative flex-shrink-0 mx-2 mb-1">
      <Avatar className="h-6 w-6 border border-gray-200">
        <AvatarImage 
          src={isUserMessage ? userAvatar : agentAvatar} 
          alt={isUserMessage ? "User" : "Agent"}
          className="object-cover"
          loading="lazy"
        />
        <AvatarFallback className="text-[10px] bg-gray-100">
          <User size={14} />
        </AvatarFallback>
      </Avatar>
      
      {/* Status indicator for agent */}
      {!isUserMessage && agentStatus && (
        <span 
          className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-white ${statusColorMap[agentStatus]}`}
        />
      )}
    </div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
