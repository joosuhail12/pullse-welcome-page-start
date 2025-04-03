
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

// This should match the MessageReadStatus in types.ts
export type MessageReadStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReadReceiptProps {
  status: MessageReadStatus;
  timestamp?: Date;
  className?: string;
}

const MessageReadReceipt: React.FC<MessageReadReceiptProps> = ({
  status,
  timestamp,
  className = ''
}) => {
  let icon = null;
  let tooltip = '';

  switch (status) {
    case 'sent':
      icon = <Check size={14} className="text-gray-400" />;
      tooltip = 'Sent';
      break;
    case 'delivered':
      icon = <Check size={14} className="text-blue-400" />;
      tooltip = 'Delivered';
      break;
    case 'read':
      icon = <CheckCheck size={14} className="text-green-500" />;
      tooltip = 'Read';
      break;
    case 'failed':
      icon = <span className="text-red-500 text-xs">!</span>;
      tooltip = 'Failed to send';
      break;
    default:
      return null;
  }

  const timeString = timestamp 
    ? new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).format(timestamp)
    : '';
  
  return (
    <div className={`flex items-center space-x-1 ${className}`} title={`${tooltip} ${timeString}`}>
      {icon}
      {status === 'read' && timestamp && (
        <span className="text-xs text-gray-400">{timeString}</span>
      )}
    </div>
  );
};

export default MessageReadReceipt;
