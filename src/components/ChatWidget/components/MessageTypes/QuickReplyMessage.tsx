
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState<boolean>(false);

  // Process either direct props or metadata
  const repliesToUse = options || [];

  const handleReplyClick = (replyText: string) => {
    if (!allowUserAction) return;
    setSelectedOption(replyText);
    setAreButtonsDisabled(true);
    onSubmit("action_button", {
      action_button: {
        label: replyText
      }
    }, messageId);
  };

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      {repliesToUse.map((reply, i) => {
        const isSelected = selectedOption === reply;
        
        return (
          <Button
            key={i}
            disabled={areButtonsDisabled || !allowUserAction}
            variant="outline"
            className={cn(
              "w-full h-auto py-3 px-4 text-sm font-normal text-left justify-start",
              "bg-white border-2 border-blue-500 text-blue-600 rounded-full",
              "hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected && "bg-blue-500 text-white border-blue-500"
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                borderColor: config.colors.primaryColor,
                color: config.colors.primaryColor
              }),
              ...(config.colors?.primaryColor && isSelected && {
                backgroundColor: config.colors.primaryColor,
                borderColor: config.colors.primaryColor,
                color: 'white'
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            {sanitizeInput(reply)}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyMessage;
