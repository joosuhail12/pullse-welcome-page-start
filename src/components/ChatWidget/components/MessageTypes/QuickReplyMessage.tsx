
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickReplyMessageProps {
  options?: Array<{ text: string; action: string }>;
  onSelect?: (action: string) => void;
  metadata?: Record<string, any>;
  onReply?: (text: string) => void;
}

const QuickReplyMessage: React.FC<QuickReplyMessageProps> = ({
  options = [],
  onSelect,
  metadata,
  onReply
}) => {
  const handleButtonClick = (option: { text: string; action: string }) => {
    if (onSelect) {
      onSelect(option.action);
    }
    if (onReply) {
      onReply(option.text);
    }
  };

  return (
    <div className="quick-reply-message">
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => handleButtonClick(option)}
              className="text-xs whitespace-nowrap"
            >
              {option.text}
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-xs italic">No quick reply options available</div>
      )}
    </div>
  );
};

export default QuickReplyMessage;
