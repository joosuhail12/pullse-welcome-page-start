
import React from 'react';
import { ThumbsUp, ThumbsDown, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MessageReactionButtonsProps {
  onReact: (emoji: string) => void;
  onClose: () => void;
}

const MessageReactionButtons: React.FC<MessageReactionButtonsProps> = ({ onReact, onClose }) => {
  return (
    <div className="absolute -top-10 right-0 bg-white rounded-full shadow-lg p-1 flex items-center z-10">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full hover:bg-gray-100"
        onClick={() => onReact('thumbsUp')}
      >
        <ThumbsUp size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full hover:bg-gray-100"
        onClick={() => onReact('thumbsDown')}
      >
        <ThumbsDown size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 rounded-full hover:bg-gray-100"
        onClick={onClose}
      >
        <Smile size={16} />
      </Button>
    </div>
  );
};

export default MessageReactionButtons;
