
import React from 'react';
import { Check, CheckCheck, Loader2, FilePlus } from 'lucide-react';

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: Date;
  isFileMessage?: boolean;
  fileUploading?: boolean;
}

const MessageStatus = ({ 
  status = 'sent', 
  timestamp, 
  isFileMessage = false,
  fileUploading = false
}: MessageStatusProps) => {
  return (
    <div className="flex items-center justify-end mt-1 text-xs gap-1">
      <span className="text-[10px] sm:text-xs text-gray-500">
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      
      {status === 'sending' && (
        <div className="flex items-center text-gray-400 message-sending" title="Sending...">
          <Loader2 size={11} className="animate-spin" />
        </div>
      )}
      
      {status === 'sent' && (
        <div className="flex items-center text-gray-500 status-icon-animation" title="Sent">
          <Check size={12} />
        </div>
      )}
      
      {status === 'delivered' && (
        <div className="flex items-center text-gray-600 status-icon-animation" title="Delivered">
          <CheckCheck size={12} />
        </div>
      )}
      
      {status === 'read' && (
        <div className="flex items-center text-vivid-purple status-icon-animation" title="Read">
          <CheckCheck size={12} />
          <span className="ml-1 text-[10px] hidden sm:inline">Read</span>
        </div>
      )}
      
      {isFileMessage && fileUploading && (
        <div className="flex items-center text-vivid-purple loading-pulse" title="Uploading file...">
          <FilePlus size={12} className="animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default MessageStatus;
