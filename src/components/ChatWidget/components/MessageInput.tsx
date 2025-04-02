
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  hasUserSentMessage: boolean;
}

const MessageInput = ({ 
  messageText, 
  setMessageText, 
  handleSendMessage, 
  handleFileUpload,
  handleEndChat,
  hasUserSentMessage
}: MessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    // Fixed: This is the problematic line - we need to properly handle emoji selection
    setMessageText(messageText + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t p-3">
      <div className="flex flex-col">
        <div className="flex items-center">
          <label htmlFor="file-upload" className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
            <Paperclip size={18} className="text-gray-500" />
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
          
          <div className="relative flex-grow mx-2">
            <Textarea 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow min-h-[40px] max-h-[120px] p-2 border rounded-md focus:outline-none resize-none pr-10"
              rows={1}
            />
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Smile size={18} className="text-gray-500" />
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
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="h-auto rounded-md bg-vivid-purple hover:bg-vivid-purple/90 p-2"
          >
            <Send size={18} />
          </Button>
        </div>
        
        {hasUserSentMessage && (
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEndChat}
              className="text-xs text-gray-500"
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
