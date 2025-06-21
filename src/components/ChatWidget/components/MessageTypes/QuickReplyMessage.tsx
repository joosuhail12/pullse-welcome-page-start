
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
    <div className="flex flex-col gap-2.5 w-full max-w-md">
      {repliesToUse.map((reply, i) => {
        const isSelected = selectedOption === reply;
        
        return (
          <Button
            key={i}
            disabled={areButtonsDisabled || !allowUserAction}
            variant="outline"
            className={cn(
              "group relative w-full h-11 px-4 text-left justify-between",
              "bg-white/98 backdrop-blur-sm border border-gray-200/50 rounded-xl",
              "text-gray-800 font-medium text-sm",
              "transition-all duration-300 ease-out",
              "hover:bg-gradient-to-r hover:from-white hover:via-gray-50/30 hover:to-white",
              "hover:border-gray-300/60 hover:shadow-md hover:shadow-gray-200/30",
              "hover:-translate-y-px hover:scale-[1.015]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none",
              "active:scale-[0.99] active:translate-y-0",
              "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:pointer-events-none",
              isSelected && [
                "bg-gradient-to-r from-blue-50/95 to-blue-50/80",
                "border-blue-200/60 text-blue-800",
                "shadow-md shadow-blue-100/50",
                "ring-2 ring-blue-100/70"
              ]
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--focus-ring-color': `${config.colors.primaryColor}15`,
                '--focus-border-color': `${config.colors.primaryColor}50`
              }),
              ...(config.colors?.primaryColor && isSelected && {
                background: `linear-gradient(135deg, ${config.colors.primaryColor}08, ${config.colors.primaryColor}04)`,
                borderColor: `${config.colors.primaryColor}30`,
                color: config.colors.primaryColor,
                boxShadow: `0 4px 16px ${config.colors.primaryColor}10`
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <span className="flex-1 truncate leading-tight">
              {sanitizeInput(reply)}
            </span>
            
            {isSelected && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-scale-in">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyMessage;
