
import React from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

export interface QuickReplyMessageProps {
  metadata: Record<string, any>;
  onReply: (text: string) => void;
}

const QuickReplyMessage: React.FC<QuickReplyMessageProps> = ({ metadata, onReply }) => {
  if (!metadata || !metadata.quickReplies || !metadata.quickReplies.length) return null;
  
  return (
    <div className="flex flex-col">
      {metadata.text && <p className="mb-2">{sanitizeInput(metadata.text)}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {metadata.quickReplies.map((reply: { text: string; action?: string }, i: number) => (
          <Button 
            key={i} 
            size="sm" 
            variant="secondary" 
            className="text-xs py-1.5 h-auto"
            onClick={() => onReply(sanitizeInput(reply.text))}
          >
            {sanitizeInput(reply.text)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyMessage;
