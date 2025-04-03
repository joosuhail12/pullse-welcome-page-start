
import React from 'react';
import { Smile, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';

export interface MessageReactionButtonsProps {
  onReaction?: (emoji: string) => void; // Changed from onReact to onReaction
  onClose: () => void;
}

const MessageReactionButtons = ({ onReaction, onClose }: MessageReactionButtonsProps) => {
  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(emoji);
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
