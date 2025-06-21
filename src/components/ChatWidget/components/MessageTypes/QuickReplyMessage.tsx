
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
    <div className="flex flex-col gap-2 w-full max-w-md">
      {repliesToUse.map((reply, i) => {
        const isSelected = selectedOption === reply;
        
        return (
          <Button
            key={i}
            disabled={areButtonsDisabled || !allowUserAction}
            variant="outline"
            className={cn(
              "group relative w-full h-10 px-3 text-left justify-between overflow-hidden",
              "bg-white/95 backdrop-blur border border-gray-200/70 rounded-lg",
              "text-gray-700 font-medium text-sm leading-tight",
              "transition-all duration-200 ease-out",
              "hover:bg-gray-50/80 hover:border-gray-300/80 hover:shadow-sm",
              "hover:scale-[1.01] hover:-translate-y-0.5",
              "focus:outline-none focus:ring-1 focus:ring-blue-400/40 focus:border-blue-300/60",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none",
              "active:scale-[0.995] active:translate-y-0",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 before:pointer-events-none",
              isSelected && [
                "bg-gradient-to-r from-blue-50/90 to-indigo-50/70",
                "border-blue-300/60 text-blue-800",
                "shadow-sm ring-1 ring-blue-200/50"
              ]
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--focus-ring-color': `${config.colors.primaryColor}40`,
                '--focus-border-color': `${config.colors.primaryColor}60`
              }),
              ...(config.colors?.primaryColor && isSelected && {
                background: `linear-gradient(135deg, ${config.colors.primaryColor}12, ${config.colors.primaryColor}08)`,
                borderColor: `${config.colors.primaryColor}40`,
                color: config.colors.primaryColor,
                boxShadow: `0 2px 8px ${config.colors.primaryColor}15`
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <span className="flex-1 truncate pr-2">
              {sanitizeInput(reply)}
            </span>
            
            {isSelected && (
              <div className="flex-shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-scale-in">
                  <Check className="w-2 h-2 text-white" strokeWidth={2.5} />
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
