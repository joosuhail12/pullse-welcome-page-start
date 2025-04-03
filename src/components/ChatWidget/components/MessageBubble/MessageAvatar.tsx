
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { AgentStatus } from '../../types';

export interface MessageAvatarProps {
  isUserMessage: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  agentStatus?: AgentStatus;
}

const MessageAvatar = ({ 
  isUserMessage, 
  userAvatar, 
  agentAvatar,
  agentStatus 
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

  return (
    <div className={`relative flex-shrink-0 ${isUserMessage ? 'ml-2' : 'mr-2'}`}>
      <Avatar className="h-8 w-8 border border-gray-200">
        <AvatarImage 
          src={isUserMessage ? userAvatar : agentAvatar} 
          alt={isUserMessage ? "User" : "Agent"}
        />
        <AvatarFallback className="bg-gray-100">
          {isUserMessage ? <User size={15} className="text-gray-500" /> : <Bot size={15} className="text-gray-500" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Status indicator for agent avatar */}
      {!isUserMessage && agentStatus && (
        <span 
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusColor()}`}
          title={`Agent is ${agentStatus}`}
        />
      )}
    </div>
  );
};

export default MessageAvatar;
