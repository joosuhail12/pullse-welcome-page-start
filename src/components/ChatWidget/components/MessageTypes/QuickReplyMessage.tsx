
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
              "group relative w-full h-9 px-3.5 text-left justify-between overflow-hidden",
              "bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur border border-gray-200/80 rounded-xl",
              "text-gray-700 font-medium text-sm leading-tight tracking-tight",
              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "hover:bg-gradient-to-br hover:from-gray-50/80 hover:via-white hover:to-gray-100/40",
              "hover:border-gray-300/70 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.08)]",
              "hover:scale-[1.015] hover:-translate-y-0.5",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none",
              "active:scale-[0.995] active:translate-y-0 active:duration-75",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:pointer-events-none",
              "after:absolute after:inset-0 after:rounded-xl after:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.02)] after:pointer-events-none",
              isSelected && [
                "bg-gradient-to-br from-blue-50/95 via-indigo-50/80 to-blue-100/50",
                "border-blue-300/60 text-blue-800 shadow-[0_3px_10px_rgba(59,130,246,0.15),0_1px_2px_rgba(59,130,246,0.1)]",
                "ring-1 ring-blue-200/40 scale-[1.01]"
              ]
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--focus-ring-color': `${config.colors.primaryColor}30`,
                '--focus-border-color': `${config.colors.primaryColor}50`
              }),
              ...(config.colors?.primaryColor && isSelected && {
                background: `linear-gradient(135deg, ${config.colors.primaryColor}15 0%, ${config.colors.primaryColor}08 50%, ${config.colors.primaryColor}12 100%)`,
                borderColor: `${config.colors.primaryColor}50`,
                color: config.colors.primaryColor,
                boxShadow: `0 3px 10px ${config.colors.primaryColor}20, 0 1px 2px ${config.colors.primaryColor}15`
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <span className="flex-1 truncate pr-2 font-medium">
              {sanitizeInput(reply)}
            </span>
            
            {isSelected && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-[scale-in_0.3s_ease-out] shadow-sm">
                  <Check className="w-1.5 h-1.5 text-white" strokeWidth={3} />
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
