
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface MessageInputProps {
  messageText: string;
  setMessageText: (value: string) => void;
  onSendMessage: () => void;
  onUserTyping: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileError?: string | null;
  isDisabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageText,
  setMessageText,
  onSendMessage,
  onUserTyping,
  onFileUpload,
  fileError,
  isDisabled = false,
  placeholder = "Type a message...",
  isLoading = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && !isDisabled && !isLoading) {
      onSendMessage();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    onUserTyping();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim() && !isDisabled && !isLoading) {
        onSendMessage();
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      onFileUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-2 sm:p-3">
      {fileError && (
        <Alert variant="destructive" className="mb-2 py-1 px-3 text-xs">
          <div className="flex items-center justify-between">
            <span>{fileError}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5" 
              onClick={() => setMessageText("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      )}
      
      <form
        onSubmit={handleSubmit}
        className={`flex items-end gap-2 rounded-md border ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileButtonClick}
          disabled={isDisabled}
          className="flex-shrink-0 h-8 w-8 ml-1 mb-1"
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <textarea
          value={messageText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={placeholder}
          rows={1}
          className="flex-grow min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent p-2 focus:ring-0 focus:outline-none text-sm"
          style={{
            overflowY: "auto"
          }}
        />
        
        <Button
          type="submit"
          size="icon"
          disabled={!messageText.trim() || isDisabled || isLoading}
          className="flex-shrink-0 h-8 w-8 mr-1 mb-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
      </form>
    </div>
  );
};

export default MessageInput;
