
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sanitizeInput } from '../../utils/validation';
import { ChatWidgetConfig } from '../../config';
import { useWidgetConfig } from '../../hooks/useWidgetConfig';
import { UserType } from '../../types';
import { MessageType } from '../../types';
import MessageStatus from '../MessageBubble/MessageStatus';
import { cn } from '@/lib/utils';
import { UserActionData } from '../../hooks/useMessageActions';

interface QuickReplyMessageProps {
  options: string[];
  onSubmit: (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => void;
  allowUserAction?: boolean;
  messageId: string;
}

const QuickReplyMessage = ({ options, onSubmit, allowUserAction = true, messageId }: QuickReplyMessageProps) => {
  const { config } = useWidgetConfig();
  const [areButtonsDisabled, setAreButtonsDisabled] = useState<boolean>(false);

  // Disable buttons once pressed

  // Process either direct props or metadata
  const repliesToUse = options || [];

  const handleReplyClick = (replyText: string) => {
    if (!allowUserAction) return;
    setAreButtonsDisabled(true);
    onSubmit("action_button", {
      action_button: {
        label: replyText
      }
    }, messageId);
  };

  return (
    <div className="flex flex-col">
      {repliesToUse.length > 0 && (
        <div className="mt-1 mb-1 flex flex-wrap gap-2">
          {repliesToUse.map((reply, i) => (
            <Button
              key={i}
              size="sm"
              disabled={areButtonsDisabled || !allowUserAction}
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
