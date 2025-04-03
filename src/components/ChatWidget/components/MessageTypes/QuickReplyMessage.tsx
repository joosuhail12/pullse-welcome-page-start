
import React from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';

interface QuickReply {
  text: string;
  action: string;
}

interface QuickReplyMessageProps {
  text?: string;
  quickReplies?: QuickReply[];
  renderText?: (text: string) => React.ReactNode;
  setMessageText?: (text: string) => void;
  metadata?: Record<string, any>;
  onReply?: (text: string) => void; // Added onReply prop
}

const QuickReplyMessage = ({ text, quickReplies, renderText, setMessageText, metadata, onReply }: QuickReplyMessageProps) => {
  // Process either direct props or metadata
  const textToUse = text || (metadata?.text as string) || '';
  const repliesToUse = quickReplies || (metadata?.quickReplies as QuickReply[]) || [];
  
  const handleReplyClick = (replyText: string) => {
    const sanitizedText = sanitizeInput(replyText);
    // Call both handlers if provided
    if (setMessageText) {
      setMessageText(sanitizedText);
    }
    if (onReply) {
      onReply(sanitizedText);
    }
  };
  
  const renderTextContent = () => {
    if (!textToUse) return null;
    if (renderText) return renderText(textToUse);
    return textToUse;
  };
  
  return (
    <div className="flex flex-col">
      {renderTextContent()}
      {repliesToUse.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {repliesToUse.map((reply, i) => (
            <Button 
              key={i} 
              size="sm" 
              variant="secondary" 
              className="text-xs py-1.5 h-auto"
              onClick={() => handleReplyClick(reply.text)}
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
