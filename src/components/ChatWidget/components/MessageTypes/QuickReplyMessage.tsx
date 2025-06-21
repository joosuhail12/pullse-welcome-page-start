
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
import { Check } from 'lucide-react';

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
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {repliesToUse.map((reply, i) => {
        const isSelected = selectedOption === reply;
        
        return (
          <Button
            key={i}
            disabled={areButtonsDisabled || !allowUserAction}
            variant="outline"
            className={cn(
              "group relative w-full h-auto py-2.5 px-4 text-left justify-between",
              "bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-lg",
              "text-gray-700 font-normal text-sm",
              "transition-all duration-200 ease-out",
              "hover:bg-gray-50/80 hover:border-gray-300/80",
              "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected && "bg-blue-50/80 border-blue-200/80 text-blue-700",
              isSelected && "ring-1 ring-blue-200/50"
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--focus-ring-color': `${config.colors.primaryColor}30`,
                '--focus-border-color': `${config.colors.primaryColor}50`
              }),
              ...(config.colors?.primaryColor && isSelected && {
                backgroundColor: `${config.colors.primaryColor}08`,
                borderColor: `${config.colors.primaryColor}30`,
                color: config.colors.primaryColor
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <span className="flex-1 truncate">
              {sanitizeInput(reply)}
            </span>
            
            {isSelected && (
              <div className="flex-shrink-0 ml-2">
                <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyMessage;
