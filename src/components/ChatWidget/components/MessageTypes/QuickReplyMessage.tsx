
import React from 'react';
import { Button } from '@/components/ui/button';

export interface QuickReplyMessageProps {
  options?: string[];
  onReply: (text: string) => void;
  metadata?: Record<string, any>;
}

const QuickReplyMessage: React.FC<QuickReplyMessageProps> = ({ 
  options, 
  onReply,
  metadata
}) => {
  const quickReplyOptions = options || metadata?.options || [];
  
  if (quickReplyOptions.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {quickReplyOptions.map((option, index) => (
        <Button
          key={`quick-reply-${index}`}
          variant="secondary"
          size="sm"
          onClick={() => onReply(option)}
          className="text-xs py-1 h-auto"
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplyMessage;
