
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X, Image } from 'lucide-react';
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
  const [filePreview, setFilePreview] = useState<{url: string, type: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_CHARS = 2000;
  const charCount = messageText.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isAtLimit = charCount >= MAX_CHARS;
  
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
    setFilePreview(null);
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
    
    // Generate preview
    if (file.type.startsWith('image/')) {
      setFilePreview({
        url: URL.createObjectURL(file),
        type: 'image',
        name: sanitizedName
      });
    } else {
      setFilePreview({
        url: '',
        type: file.type,
        name: sanitizedName
      });
    }
  };
  
  const clearFilePreview = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const submitFile = () => {
    if (fileInputRef.current && fileInputRef.current.files?.length) {
      handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      clearFilePreview();
    }
  };

  return (
    <div className="border-t border-gray-100 p-3 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col">
        {fileError && (
          <div className="mb-2 text-xs text-red-500 p-2 bg-red-50 rounded">
            {fileError}
          </div>
        )}
        
        {filePreview && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
            {filePreview.type === 'image' ? (
              <div className="relative w-14 h-14 mr-2">
                <img 
                  src={filePreview.url} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                <Image size={20} className="text-gray-500" />
              </div>
            )}
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium truncate">{filePreview.name}</p>
              <p className="text-xs text-gray-500">Ready to upload</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={clearFilePreview}
                title="Cancel"
              >
                <X size={16} />
              </Button>
              <Button 
                size="sm" 
                className="h-8 chat-widget-button"
                onClick={submitFile}
              >
                Send
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-vivid-purple focus-within:border-vivid-purple">
          <label htmlFor="file-upload" className={`cursor-pointer p-2 ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'} rounded-l-md transition-colors`}>
            <Paperclip size={18} className="text-gray-500" />
            <input 
              ref={fileInputRef}
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
              className={`min-h-[44px] max-h-[120px] p-2 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm
                ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-600' : ''}`}
              rows={1}
              maxLength={MAX_CHARS}
              disabled={disabled}
            />
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  disabled={disabled}
                >
                  <Smile size={16} className="text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-auto p-0 border-none">
                <div className="emoji-picker-container">
                  <Picker 
                    data={data} 
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                  />
                </div>
              </PopoverContent>
            </Popover>
            {charCount > 0 && (
              <div 
                className={`absolute right-8 bottom-1 text-xs px-1.5 py-0.5 rounded-full
                  ${isAtLimit ? 'bg-red-100 text-red-700' : 
                  isNearLimit ? 'bg-amber-100 text-amber-700' : 
                  'bg-gray-100 text-gray-500'}`}
              >
                {charCount}/{MAX_CHARS}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim() || disabled}
            className="h-auto rounded-r-md chat-widget-button p-2 aspect-square"
            variant={messageText.trim() ? "default" : "ghost"}
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
              className="text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
