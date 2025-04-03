
import React from 'react';
import { Message } from '../../types';
import { Copy, Star } from 'lucide-react';

interface MessageActionsProps {
  message: Message;
  isLast?: boolean;
  onToggleHighlight?: (messageId: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({ 
  message, 
  isLast,
  onToggleHighlight
}) => {
  // Handle highlight toggle
  const handleToggleHighlight = () => {
    if (onToggleHighlight) {
      onToggleHighlight(message.id);
    }
  };

  return (
    <div className="flex items-center justify-end mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Only show actions for the types of messages that support them */}
      {message.type !== 'status' && (
        <>
          {/* Copy button */}
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => navigator.clipboard.writeText(message.text)}
            aria-label="Copy message text"
          >
            <Copy size={14} />
          </button>
          
          {/* Highlight button */}
          {onToggleHighlight && (
            <button 
              className="text-gray-400 hover:text-yellow-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleToggleHighlight}
              aria-label="Highlight message"
            >
              <Star size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MessageActions;
