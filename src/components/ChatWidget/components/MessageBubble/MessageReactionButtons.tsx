
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageReactionButtonsProps {
  messageId: string;
  currentReaction?: 'thumbsUp' | 'thumbsDown' | null;
  onReact: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
}

const MessageReactionButtons = ({ messageId, currentReaction, onReact }: MessageReactionButtonsProps) => {
  return (
    <div className="flex gap-2 mt-1.5">
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-auto ${currentReaction === 'thumbsUp' ? 'bg-green-100' : ''}`}
        onClick={() => onReact(messageId, 'thumbsUp')}
      >
        <ThumbsUp size={14} className={currentReaction === 'thumbsUp' ? 'text-green-600' : 'text-gray-500'} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-auto ${currentReaction === 'thumbsDown' ? 'bg-red-100' : ''}`}
        onClick={() => onReact(messageId, 'thumbsDown')}
      >
        <ThumbsDown size={14} className={currentReaction === 'thumbsDown' ? 'text-red-600' : 'text-gray-500'} />
      </Button>
    </div>
  );
};

export default MessageReactionButtons;
