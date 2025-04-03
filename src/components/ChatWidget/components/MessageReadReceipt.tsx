
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export type MessageReadStatus = 'sent' | 'delivered' | 'read';

interface MessageReadReceiptProps {
  status: MessageReadStatus;
  timestamp?: Date;
}

const MessageReadReceipt: React.FC<MessageReadReceiptProps> = ({ status, timestamp }) => {
  // Only show full receipt for 'read' status
  if (status !== 'read') {
    return null;
  }
  
  return (
    <div className="flex items-center text-[10px] text-gray-500">
      <CheckCheck size={10} className="text-vivid-purple mr-0.5" />
      <span>Read</span>
      {timestamp && (
        <span className="ml-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

// Export the MessageReadStatus type so it can be imported elsewhere
export { MessageReadStatus };
export default MessageReadReceipt;
