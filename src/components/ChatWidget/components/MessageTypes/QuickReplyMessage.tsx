
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
              "group relative w-full h-auto py-4 px-6 text-left justify-start",
              "bg-white border-2 rounded-xl shadow-sm",
              "text-gray-700 font-medium text-sm leading-relaxed",
              "transition-all duration-300 ease-out",
              "hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0",
              !isSelected && "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50",
              isSelected && "border-green-500 bg-green-50 text-green-700 shadow-green-100",
              !isSelected && "focus:ring-blue-500",
              isSelected && "focus:ring-green-500"
            )}
            style={{
              ...(config.colors?.primaryColor && !isSelected && {
                '--hover-border-color': config.colors.primaryColor,
                '--hover-bg-color': `${config.colors.primaryColor}08`,
                '--focus-ring-color': `${config.colors.primaryColor}50`
              })
            }}
            onClick={() => handleReplyClick(reply)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex-1 pr-2">
                {sanitizeInput(reply)}
              </span>
              
              {isSelected && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
              
              {!isSelected && !areButtonsDisabled && (
                <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              )}
            </div>
            
            {/* Subtle gradient overlay on hover */}
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
              "bg-gradient-to-r from-transparent via-white/20 to-transparent",
              !isSelected && "group-hover:opacity-100"
            )} />
          </Button>
        );
      })}
    </div>
  );
};

export default QuickReplyMessage;
