
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleEndChat?: () => void;
  hasUserSentMessage?: boolean;
  onTyping?: () => void;
  disabled?: boolean;
  testMode?: boolean;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  handleSendMessage,
  handleEndChat,
  hasUserSentMessage,
  onTyping,
  disabled = false,
  testMode = false,
  onFileUpload
}) => {
  const [isFileUploadHovered, setIsFileUploadHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFileUpload) {
      onFileUpload(e);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-2 sm:p-3 border-t border-gray-100 bg-white">
      {testMode && (
        <div className="mb-2 text-xs bg-orange-50 text-orange-800 p-1.5 rounded border border-orange-100">
          Test mode active - No real messages will be sent
        </div>
      )}
      
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Textarea
            value={messageText}
            onChange={handleMessageInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none bg-gray-50 border-gray-100 focus:bg-white pr-8"
            rows={1}
            maxRows={5}
            autoGrow
            disabled={disabled}
          />
          
          {onFileUpload && (
            <div className="absolute right-3 bottom-2.5">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileInputChange}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={`h-6 w-6 rounded-full p-0 ${isFileUploadHovered ? 'bg-gray-200' : ''}`}
                onClick={openFileSelector}
                onMouseEnter={() => setIsFileUploadHovered(true)}
                onMouseLeave={() => setIsFileUploadHovered(false)}
                disabled={disabled}
              >
                <Paperclip size={14} className="text-gray-500" />
              </Button>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleSendMessage}
          className="ml-2 h-8 w-8 rounded-full p-0"
          disabled={!messageText.trim() || disabled}
          title="Send message"
        >
          <Send size={14} className="mr-0.5 mb-0.5" />
        </Button>
      </div>
      
      {handleEndChat && hasUserSentMessage && (
        <div className="mt-2 text-center">
          <Button
            variant="link"
            className="text-xs text-gray-500 hover:text-gray-700"
            size="sm"
            onClick={handleEndChat}
          >
            End chat
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
