
import React from 'react';
import { Button } from '@/components/ui/button';

export interface QuickReplyMessageProps {
  metadata?: Record<string, any>;
  onReply?: (text: string) => void;
}

const QuickReplyMessage: React.FC<QuickReplyMessageProps> = ({ metadata, onReply }) => {
  if (!metadata || !metadata.quickReplies) return null;
  
  const quickReplies = metadata.quickReplies || [];

  return (
    <div className="flex flex-col">
      {quickReplies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickReplies.map((reply: {text: string, action: string}, i: number) => (
            <Button 
              key={i} 
              size="sm" 
              variant="secondary" 
              className="text-xs py-1.5 h-auto"
              onClick={() => onReply && onReply(reply.text)}
            >
              {reply.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickReplyMessage;
