
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReactionButtonsProps {
  messageId: string;
  currentReaction?: 'thumbsUp' | 'thumbsDown' | null;
  onReact: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  animate?: boolean;
}

const MessageReactionButtons = ({
  messageId,
  currentReaction,
  onReact,
  animate = false
}: MessageReactionButtonsProps) => {
  return (
    <div className="flex gap-2 mt-1.5">
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-auto transition-all ${currentReaction === 'thumbsUp' ? 'bg-green-100' : ''} ${currentReaction === 'thumbsUp' && animate ? 'reaction-selected' : ''}`}
        onClick={() => onReact(messageId, 'thumbsUp')}
        aria-label="Thumbs up"
      >
        <ThumbsUp 
          size={14} 
          className={`transition-colors ${currentReaction === 'thumbsUp' ? 'text-green-600' : 'text-gray-500'}`} 
        />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-auto transition-all ${currentReaction === 'thumbsDown' ? 'bg-red-100' : ''} ${currentReaction === 'thumbsDown' && animate ? 'reaction-selected' : ''}`}
        onClick={() => onReact(messageId, 'thumbsDown')}
        aria-label="Thumbs down"
      >
        <ThumbsDown 
          size={14} 
          className={`transition-colors ${currentReaction === 'thumbsDown' ? 'text-red-600' : 'text-gray-500'}`} 
        />
      </Button>
    </div>
  );
};

export default MessageReactionButtons;
