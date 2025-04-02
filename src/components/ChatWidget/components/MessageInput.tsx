
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { validateMessage, validateFile, sanitizeFileName } from '../utils/validation';

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  hasUserSentMessage: boolean;
  onTyping?: () => void;
  disabled?: boolean;
}

const MessageInput = ({ 
  messageText, 
  setMessageText, 
  handleSendMessage, 
  handleFileUpload,
  handleEndChat,
  hasUserSentMessage,
  onTyping,
  disabled = false
}: MessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    const sanitized = validateMessage(messageText + emoji.native);
    setMessageText(sanitized);
    setShowEmojiPicker(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Validate and sanitize input
    const sanitized = validateMessage(e.target.value);
    setMessageText(sanitized);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
    }
  };

  const handleFileValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    if (!validateFile(file)) {
      setFileError("Invalid file. Please upload images, PDFs, or documents under 5MB.");
      e.target.value = '';
      return;
    }
    
    // Sanitize filename
    const sanitizedName = sanitizeFileName(file.name);
    
    // Create a new file with sanitized name if name was changed
    if (sanitizedName !== file.name) {
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(sanitizedFile);
      e.target.files = dataTransfer.files;
    }
    
    // Proceed with upload
    handleFileUpload(e);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col">
        {fileError && (
          <div className="mb-2 text-xs text-red-500 p-2 bg-red-50 rounded-md animate-fade-in">
            <div className="flex items-center">
              <X size={14} className="mr-1" />
              {fileError}
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label htmlFor="file-upload" className={`cursor-pointer p-2.5 rounded-full ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'} transition-colors`}>
            <Paperclip size={18} className="text-gray-500" />
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileValidation}
              accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={disabled}
            />
          </label>
          
          <div className="relative flex-grow">
            <Textarea 
              value={messageText}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow min-h-[44px] max-h-[120px] p-3 border rounded-lg focus:outline-none resize-none pr-10 text-sm shadow-sm focus:ring-1 focus:ring-vivid-purple-300 transition-shadow"
              rows={1}
              maxLength={2000}
              disabled={disabled}
            />
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
                  disabled={disabled}
                >
                  <Smile size={18} className="text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-auto p-0 border-none shadow-lg rounded-lg">
                <div className="emoji-picker-container">
                  <Picker 
                    data={data} 
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim() || disabled}
            className="h-10 w-10 rounded-full chat-widget-button p-0 flex items-center justify-center transition-transform hover:scale-105"
          >
            <Send size={18} />
          </Button>
        </div>
        
        {hasUserSentMessage && (
          <div className="flex justify-center mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEndChat}
              className="text-xs text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              disabled={disabled}
            >
              <X size={14} className="mr-1" /> End chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
