
import React from 'react';
import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export type MessageReadStatus = 'unread' | 'delivered' | 'read' | 'sent';

interface MessageReadReceiptProps {
  status: MessageReadStatus;
  timestamp?: Date;
}

const MessageReadReceipt: React.FC<MessageReadReceiptProps> = ({ status, timestamp }) => {
  // Don't render anything for unread status
  if (status === 'unread') {
    return null;
  }

  // Determine the style based on the status
  const getStatusStyle = () => {
    switch (status) {
      case 'read':
        return 'text-green-500';
      case 'delivered':
        return 'text-blue-500';
      case 'sent':
      default:
        return 'text-gray-400';
    }
  };

  // Get the appropriate text label
  const getLabel = () => {
    switch (status) {
      case 'read':
        return 'Read';
      case 'delivered':
        return 'Delivered';
      case 'sent':
      default:
        return 'Sent';
    }
  };

  // Format timestamp if available
  const getTimeString = () => {
    if (!timestamp) return '';
    
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 transition-all duration-200">
            {status === 'read' ? (
              <div className="flex">
                <Check className={`h-3 w-3 ${getStatusStyle()}`} />
                <Check className={`h-3 w-3 -ml-1 ${getStatusStyle()}`} />
              </div>
            ) : status === 'delivered' ? (
              <Check className={`h-3 w-3 ${getStatusStyle()} animate-subtle-fade-in`} />
            ) : (
              <div className={`h-2 w-2 rounded-full ${getStatusStyle()}`} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={5} className="text-xs bg-white/90 backdrop-blur-sm border border-gray-100">
          {getLabel()}{timestamp ? ` at ${getTimeString()}` : ''}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageReadReceipt;
