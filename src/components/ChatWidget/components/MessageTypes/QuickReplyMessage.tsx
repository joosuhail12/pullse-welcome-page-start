
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
    <div className="flex flex-col gap-3 w-full max-w-md">
      {repliesToUse.map((reply, i) => {
        const isSelected = selectedOption === reply;
        
        return (
          <Button
            key={i}
            disabled={areButtonsDisabled || !allowUserAction}
            variant="outline"
            className={cn(
              "group relative w-full h-auto py-3.5 px-5 text-left justify-between",
              "bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-xl",
              "text-gray-800 font-medium text-sm",
              "transition-all duration-300 ease-out",
              "hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white",
              "hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/40",
              "hover:-translate-y-0.5 hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/60",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none",
              "active:scale-[0.98] active:translate-y-0",
              isSelected && [
                "bg-gradient-to-r from-blue-50/90 to-indigo-50/90",
                "border-blue-300/70 text-blue-900",
                "shadow-lg shadow-blue-200/30",
                "ring-2 ring-blue-200/50"
              ]
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--focus-ring-color': `${config.colors.primaryColor}20`,
                '--focus-border-color': `${config.colors.primaryColor}60`
              }),
              ...(config.colors?.primaryColor && isSelected && {
                background: `linear-gradient(135deg, ${config.colors.primaryColor}10, ${config.colors.primaryColor}05)`,
                borderColor: `${config.colors.primaryColor}50`,
                color: config.colors.primaryColor,
                boxShadow: `0 8px 25px ${config.colors.primaryColor}15`
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <span className="flex-1 truncate leading-relaxed">
              {sanitizeInput(reply)}
            </span>
            
            {isSelected && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-scale-in shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              </div>
            )}

            {/* Subtle shine effect on hover */}
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500",
              "bg-gradient-to-r from-transparent via-white/40 to-transparent",
              "pointer-events-none",
              !isSelected && "group-hover:opacity-100"
            )} />
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyMessage;
