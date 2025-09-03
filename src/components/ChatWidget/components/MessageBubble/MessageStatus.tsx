
import React from 'react';
import { Check, CheckCheck, Clock, FilePlus } from 'lucide-react';

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

      {/* Sending status - Clock icon */}
      {status === 'sending' && (
        <div className="flex items-center text-gray-400" title="Sending...">
          <Clock size={12} className="opacity-60" />
        </div>
      )}

      {/* Sent status - Single gray tick */}
      {status === 'sent' && (
        <div className="flex items-center text-gray-500 transition-all duration-200" title="Sent">
          <Check size={12} strokeWidth={2.5} />
        </div>
      )}

      {/* Delivered status - Double gray ticks */}
      {status === 'delivered' && (
        <div className="flex items-center text-gray-500 transition-all duration-200" title="Delivered">
          <div className="relative">
            <Check size={12} strokeWidth={2.5} className="absolute" />
            <Check size={12} strokeWidth={2.5} className="ml-1.5" />
          </div>
        </div>
      )}

      {/* Read status - Double blue ticks */}
      {status === 'read' && (
        <div className="flex items-center text-blue-500 transition-all duration-200" title="Read">
          <div className="relative">
            <Check size={12} strokeWidth={2.5} className="absolute" />
            <Check size={12} strokeWidth={2.5} className="ml-1.5" />
          </div>
        </div>
      )}

      {/* File uploading indicator */}
      {isFileMessage && fileUploading && (
        <div className="flex items-center text-blue-500" title="Uploading file...">
          <FilePlus size={12} className="animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default MessageStatus;
