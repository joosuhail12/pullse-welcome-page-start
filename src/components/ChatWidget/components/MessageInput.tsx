
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, SendIcon, XCircleIcon, NetworkIcon } from 'lucide-react';

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  hasUserSentMessage: boolean;
  onTyping?: () => void;
  disabled?: boolean;
  isOffline?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  handleSendMessage,
  handleFileUpload,
  handleEndChat,
  hasUserSentMessage,
  onTyping,
  disabled = false,
  isOffline = false
}) => {
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textArea.style.height = 'auto';
    
    // Set new height based on scrollHeight (with max-height)
    const newHeight = Math.min(textArea.scrollHeight, 150);
    textArea.style.height = `${newHeight}px`;
  }, [messageText]);

  const handleSend = async () => {
    if (!messageText.trim() || disabled) return;
    
    setIsSending(true);
    
    try {
      handleSendMessage();
    } finally {
      // Reset sending state after a small delay
      setTimeout(() => {
        setIsSending(false);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <div className="flex flex-col px-4 pt-2 pb-3 bg-white border-t">
      <div className="relative flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-gray-500 hover:text-gray-700"
          onClick={handleClick}
          disabled={disabled || isSending}
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-grow">
          <textarea
            ref={textAreaRef}
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isOffline ? "You're currently offline. Type a message to send when back online." : "Type a message..."}
            className="w-full resize-none rounded-md border border-gray-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none p-3 pr-10 min-h-[40px] max-h-[150px] overflow-y-auto text-sm"
            rows={1}
            disabled={disabled}
          />
          
          {messageText && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setMessageText('')}
              type="button"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button
          type="button"
          className="flex-shrink-0 rounded-full bg-violet-600 hover:bg-violet-700 text-white"
          size="icon"
          onClick={handleSend}
          disabled={!messageText.trim() || disabled || isSending}
        >
          {isOffline ? <NetworkIcon className="h-4 w-4" /> : <SendIcon className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex justify-end mt-2">
        <button
          className="text-xs text-gray-500 hover:underline"
          onClick={handleEndChat}
          disabled={disabled}
        >
          End chat
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
