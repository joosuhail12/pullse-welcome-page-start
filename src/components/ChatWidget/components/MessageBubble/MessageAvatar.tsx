
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserType } from '../../types';

export interface MessageAvatarProps {
  sender?: UserType;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  isUserMessage?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ 
  sender = 'system',
  avatarUrl,
  status,
  isUserMessage,
  userAvatar,
  agentAvatar,
  agentStatus
}) => {
  // Use either direct status or agentStatus prop
  const finalStatus = status || agentStatus;
  
  // Determine which avatar URL to use
  const avatarSrc = isUserMessage ? userAvatar : (avatarUrl || agentAvatar);
  
  // Generate initials for fallback
  const getInitials = () => {
    if (sender === 'user' || isUserMessage) return 'U';
    if (sender === 'system' || sender === 'agent' || sender === 'bot') return 'A';
    return '?';
  };

  // Style for status indicator
  const getStatusColor = () => {
    switch (finalStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline':
      default: return 'bg-gray-400';
    }
  };

  // Style for avatar fallback
  const avatarFallbackClass = (sender === 'user' || isUserMessage)
    ? 'bg-gray-200 text-gray-700' 
    : 'bg-vivid-purple/20 text-vivid-purple';

  return (
    <div className="flex-shrink-0 relative">
      <Avatar className="h-8 w-8">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={sender} />}
        <AvatarFallback className={avatarFallbackClass}>{getInitials()}</AvatarFallback>
      </Avatar>
      
      {finalStatus && !isUserMessage && (
        <span 
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${getStatusColor()} ring-1 ring-white`}
          aria-label={`Agent is ${finalStatus}`}
        />
      )}
    </div>
  );
};

export default MessageAvatar;
