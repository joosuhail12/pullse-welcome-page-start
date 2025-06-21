
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
import { Check, ArrowRight } from 'lucide-react';

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
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/60 shadow-sm p-4 max-w-md backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -translate-y-6 translate-x-6"></div>
      
      {repliesToUse.length > 0 && (
        <div className="relative z-10">
          <div className="text-xs text-gray-600 font-medium mb-3">
            Choose an option:
          </div>
          
          <div className="flex flex-col gap-2">
            {repliesToUse.map((reply, i) => {
              const isSelected = selectedOption === reply;
              
              return (
                <Button
                  key={i}
                  size="sm"
                  disabled={areButtonsDisabled || !allowUserAction}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "justify-between h-auto py-2.5 px-3 text-xs font-medium transition-all duration-200 group",
                    "hover:shadow-md focus:ring-2 focus:ring-offset-1",
                    isSelected 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md" 
                      : "bg-white/80 hover:bg-blue-50 text-gray-700 border-gray-200/80 hover:border-blue-300/70",
                    areButtonsDisabled && !isSelected && "opacity-50",
                    "disabled:pointer-events-none"
                  )}
                  style={{
                    ...(isSelected && config.colors?.primaryColor && {
                      background: `linear-gradient(135deg, ${config.colors.primaryColor}, ${config.colors.primaryColor}dd)`
                    }),
                    ...(isSelected && config.colors?.textColor && {
                      color: config.colors.textColor
                    })
                  }}
                  onClick={() => handleReplyClick(reply)}
                >
                  <span className="flex-1 text-left">
                    {sanitizeInput(reply)}
                  </span>
                  
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 ml-2 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </Button>
              );
            })}
          </div>
          
          {areButtonsDisabled && selectedOption && (
            <div className="mt-3 p-2 bg-green-50/80 border border-green-200/60 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Selected: {selectedOption}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickReplyMessage;
