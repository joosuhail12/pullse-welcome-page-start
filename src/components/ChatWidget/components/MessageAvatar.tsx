
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { AgentStatus } from '../types';

interface MessageAvatarProps {
  sender: 'user' | 'system';
  avatarUrl?: string;
  status?: AgentStatus;
}

const MessageAvatar: React.FC<MessageAvatarProps> = React.memo(({ 
  sender, 
  avatarUrl,
  status = 'online'
}) => {
  const isUserMessage = sender === 'user';
  
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
          src={avatarUrl} 
          alt={isUserMessage ? "User" : "Agent"}
          className="object-cover"
          loading="lazy"
        />
        <AvatarFallback className="text-[10px] bg-gray-100">
          <User size={14} />
        </AvatarFallback>
      </Avatar>
      
      {/* Status indicator for agent */}
      {!isUserMessage && status && (
        <span 
          className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-white ${statusColorMap[status]}`}
        />
      )}
    </div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
