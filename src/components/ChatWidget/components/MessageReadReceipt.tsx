
import React from 'react';
import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        return 'text-green-600';
      case 'delivered':
        return 'text-blue-600';
      case 'sent':
      default:
        return 'text-gray-600';
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
          <div className="flex items-center space-x-1 transition-opacity duration-300">
            {status === 'read' ? (
              <div className="flex">
                <Check className={`h-3 w-3 ${getStatusStyle()} transition-transform duration-300 hover:scale-110`} />
                <Check className={`h-3 w-3 -ml-1 ${getStatusStyle()} transition-transform duration-300 hover:scale-110`} />
              </div>
            ) : status === 'delivered' ? (
              <Check className={`h-3 w-3 ${getStatusStyle()} transition-transform duration-300 hover:scale-110`} />
            ) : (
              <div className={`h-2 w-2 rounded-full ${getStatusStyle()} transition-transform duration-300 hover:scale-110`} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium bg-white border border-gray-200 shadow-md">
          {getLabel()}{timestamp ? ` at ${getTimeString()}` : ''}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageReadReceipt;
