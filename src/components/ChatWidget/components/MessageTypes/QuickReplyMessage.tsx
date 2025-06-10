
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';
import { ChatWidgetConfig } from '../../config';
import { useWidgetConfig } from '../../hooks/useWidgetConfig';
import { UserType } from '../../types';
import { MessageType } from '../../types';
import MessageStatus from '../MessageBubble/MessageStatus';
import { cn } from '@/lib/utils';

interface QuickReplyMessageProps {
  message: {
    id: string;
    text: string;
    type?: MessageType;
    sender: UserType;
    senderType?: 'user' | 'agent' | 'system';
    messageType?: 'text' | 'data_collection' | 'action_buttons' | 'csat' | 'mention' | 'note';
    messageConfig?: string[];
    createdAt: Date;
    metadata?: Record<string, any>;
    reactions?: string[];
    fileName?: string;
    cardData?: {
      title: string;
      description: string;
      imageUrl?: string;
      buttons?: Array<{ text: string; action: string }>;
    };
    quickReplies?: Array<{ text: string; action: string }>;
    reaction?: 'thumbsUp' | 'thumbsDown' | null;
  };
  quickReplies?: string[];
  renderText?: (text: string) => React.ReactNode;
  setMessageText?: (text: string) => void;
  metadata?: Record<string, any>;
  onReply?: (text: string) => void; // Added onReply prop
}

const QuickReplyMessage = ({ message, quickReplies, renderText, setMessageText, metadata, onReply }: QuickReplyMessageProps) => {
  const { config } = useWidgetConfig();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState<boolean>(message.text.length > 0 ? true : false);

  // Disable buttons once pressed

  // Process either direct props or metadata
  const repliesToUse = quickReplies || (metadata?.quickReplies as string[]) || [];

  const handleReplyClick = (replyText: string) => {
    setAreButtonsDisabled(true);
    const sanitizedText = sanitizeInput(replyText);
    // Call both handlers if provided
    if (setMessageText) {
      setMessageText(sanitizedText);
    }
    if (onReply) {
      onReply(sanitizedText);
    }
  };

  return (
    <div className="flex flex-col">
      {repliesToUse.length > 0 && (
        <div className="mt-1 mb-1 flex flex-wrap gap-2">
          {repliesToUse.map((reply, i) => (
            <Button
              key={i}
              size="sm"
              disabled={areButtonsDisabled}
              variant="default"
              className="text-xs py-1.5 h-auto"
              style={{
                backgroundColor: config.colors?.primaryColor,
                color: config.colors?.textColor,
                borderRadius: '10px'
              }}
              onClick={() => handleReplyClick(reply)}
            >
              {sanitizeInput(reply)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickReplyMessage;
