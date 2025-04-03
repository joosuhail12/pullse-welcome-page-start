
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type MessageReadStatus = 'sent' | 'delivered' | 'read' | 'failed';

interface MessageReadReceiptProps {
  status?: MessageReadStatus;
  timestamp?: Date;
  className?: string;
}

const MessageReadReceipt: React.FC<MessageReadReceiptProps> = ({ 
  status = 'sent', 
  timestamp,
  className
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'read':
        return {
          icon: <Check className="text-green-500" size={14} />,
          label: 'Read',
          description: timestamp ? `Read at ${timestamp.toLocaleTimeString()}` : 'Message has been read',
          doubleCheck: true
        };
      case 'delivered':
        return {
          icon: <Check className="text-gray-400" size={14} />,
          label: 'Delivered',
          description: timestamp ? `Delivered at ${timestamp.toLocaleTimeString()}` : 'Message has been delivered',
          doubleCheck: true
        };
      case 'failed':
        return {
          icon: <span className="text-red-500 text-xs">!</span>,
          label: 'Failed',
          description: 'Message failed to send. Tap to retry.',
          doubleCheck: false
        };
      case 'sent':
      default:
        return {
          icon: <Check className="text-gray-400" size={14} />,
          label: 'Sent',
          description: timestamp ? `Sent at ${timestamp.toLocaleTimeString()}` : 'Message has been sent',
          doubleCheck: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center justify-end space-x-0.5", className)}>
          {statusInfo.doubleCheck ? (
            <div className="relative">
              <Check size={14} className="text-gray-400 opacity-70" />
              <Check size={14} className={`absolute top-0 left-1 ${status === 'read' ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          ) : status === 'failed' ? (
            <div className="rounded-full bg-red-100 w-3.5 h-3.5 flex items-center justify-center">
              {statusInfo.icon}
            </div>
          ) : status === 'sent' ? (
            <Clock size={14} className="text-gray-400" />
          ) : (
            statusInfo.icon
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" align="end">
        <div className="text-xs">
          <div className="font-medium">{statusInfo.label}</div>
          <div className="text-gray-500">{statusInfo.description}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default MessageReadReceipt;
