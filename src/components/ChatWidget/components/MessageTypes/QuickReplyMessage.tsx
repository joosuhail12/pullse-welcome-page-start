
import React from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

interface QuickReply {
  text: string;
  action: string;
}

interface QuickReplyMessageProps {
  text: string;
  quickReplies?: QuickReply[];
  renderText: (text: string) => React.ReactNode;
  setMessageText?: (text: string) => void;
}

const QuickReplyMessage = ({ text, quickReplies, renderText, setMessageText }: QuickReplyMessageProps) => {
  return (
    <div className="flex flex-col">
      {renderText(text)}
      {quickReplies && quickReplies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickReplies.map((reply, i) => (
            <Button 
              key={i} 
              size="sm" 
              variant="secondary" 
              className="text-xs py-1.5 h-auto"
              onClick={() => {
                if (setMessageText) {
                  // Sanitize the quick reply text before setting
                  setMessageText(sanitizeInput(reply.text));
                }
              }}
            >
              {sanitizeInput(reply.text)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickReplyMessage;
