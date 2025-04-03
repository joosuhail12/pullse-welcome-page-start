
import React from 'react';
import { Smile, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';

export interface MessageReactionButtonsProps {
  onReact?: (emoji: string) => void;
  onClose: () => void;
}

const MessageReactionButtons = ({ onReact, onClose }: MessageReactionButtonsProps) => {
  // Alias onReaction to onReact for backward compatibility
  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(emoji);
    }
  };

  return (
    <div className="absolute -top-10 left-0 bg-white rounded-full shadow-lg p-1 flex items-center gap-1 z-10 animate-fade-in">
      <button 
        onClick={() => handleReaction('👍')} 
        className="p-1.5 hover:bg-gray-100 rounded-full"
        aria-label="Thumbs up"
      >
        <ThumbsUp size={14} />
      </button>
      <button 
        onClick={() => handleReaction('👎')} 
        className="p-1.5 hover:bg-gray-100 rounded-full"
        aria-label="Thumbs down"
      >
        <ThumbsDown size={14} />
      </button>
      <button 
        onClick={() => handleReaction('❤️')} 
        className="p-1.5 hover:bg-gray-100 rounded-full"
        aria-label="Heart"
      >
        <Heart size={14} />
      </button>
      <button 
        onClick={() => handleReaction('😀')} 
        className="p-1.5 hover:bg-gray-100 rounded-full"
        aria-label="Smile"
      >
        <Smile size={14} />
      </button>
    </div>
  );
};

export default MessageReactionButtons;
