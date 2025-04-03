
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReactionButtonsProps {
  onReaction: (emoji: string) => void;
  onClose: () => void;
  messageId?: string;
  currentReaction?: 'thumbsUp' | 'thumbsDown' | null;
  animate?: boolean;
}

const MessageReactionButtons = ({
  onReaction,
  onClose,
  messageId,
  currentReaction,
  animate = false
}: MessageReactionButtonsProps) => {
  const handleReaction = (reaction: 'thumbsUp' | 'thumbsDown') => {
    if (messageId) {
      onReaction(reaction);
    } else {
      onReaction(reaction);
    }
    onClose();
  };

  return (
    <div className="flex gap-2 mt-1.5 absolute -bottom-10 bg-white rounded-full shadow-md p-1.5 z-10">
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-auto transition-all ${currentReaction === 'thumbsUp' ? 'bg-green-100' : ''} ${currentReaction === 'thumbsUp' && animate ? 'reaction-selected' : ''}`}
        onClick={() => handleReaction('thumbsUp')}
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
        onClick={() => handleReaction('thumbsDown')}
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
