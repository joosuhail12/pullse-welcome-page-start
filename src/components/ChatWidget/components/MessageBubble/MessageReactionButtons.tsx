
import React from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MessageReactionButtonsProps {
  onReact?: (emoji: string) => void;
  onClose?: () => void;
  onReaction?: (emoji: string) => void;
}

const MessageReactionButtons: React.FC<MessageReactionButtonsProps> = ({ 
  onReact, 
  onClose,
  onReaction 
}) => {
  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(emoji);
    } else if (onReact) {
      onReact(emoji);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="absolute -top-12 right-0 bg-white shadow-lg rounded-lg p-1 flex items-center space-x-1 border border-gray-200 z-10">
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto"
        onClick={() => handleReaction('thumbsUp')}
        aria-label="Thumbs up"
      >
        <ThumbsUp size={16} className="text-gray-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto"
        onClick={() => handleReaction('thumbsDown')}
        aria-label="Thumbs down"
      >
        <ThumbsDown size={16} className="text-gray-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto"
        onClick={onClose}
        aria-label="Close reactions"
      >
        <X size={16} className="text-gray-600" />
      </Button>
    </div>
  );
};

export default MessageReactionButtons;
