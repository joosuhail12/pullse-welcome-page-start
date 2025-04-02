
import React, { memo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MessageAvatarProps {
  sender: 'user' | 'system' | 'status';
  avatarUrl?: string;
  isRight?: boolean;
}

// Using React.memo to prevent unnecessary re-renders
const MessageAvatar = memo(({ sender, avatarUrl, isRight = false }: MessageAvatarProps) => {
  const hasAvatar = !!avatarUrl;
  const initials = sender === 'system' ? 'AI' : 'U';
  const avatarClass = sender === 'system' ? 'bg-vivid-purple/20 text-vivid-purple' : 'bg-gray-200 text-gray-700';
  
  return (
    <div className={`flex-shrink-0 ${isRight ? 'order-last ml-2' : 'mr-2'}`}>
      <Avatar className="h-8 w-8">
        {hasAvatar && <AvatarImage src={avatarUrl} loading="lazy" alt={sender} />}
        <AvatarFallback className={avatarClass}>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
