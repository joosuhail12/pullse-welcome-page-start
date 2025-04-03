
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface MessageAvatarProps {
  sender: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ 
  sender,
  avatarUrl,
  status
}) => {
  const initials = sender === 'user' 
    ? 'U' 
    : sender === 'system' || sender === 'bot' || sender === 'agent'
      ? 'A'
      : 'S';
      
  const avatarClass = sender === 'user' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-blue-100 text-blue-800';

  // Status indicator colors
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline':
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative h-8 w-8">
      <Avatar className="h-8 w-8">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={sender} />}
        <AvatarFallback className={avatarClass}>{initials}</AvatarFallback>
      </Avatar>
      
      {status && sender !== 'user' && (
        <span 
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-white ${getStatusColor()}`}
        />
      )}
    </div>
  );
};

export default MessageAvatar;
