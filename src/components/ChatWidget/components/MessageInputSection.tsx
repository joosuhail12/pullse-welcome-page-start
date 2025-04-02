
import React from 'react';
import MessageInput from './MessageInput';

interface MessageInputSectionProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  hasUserSentMessage: boolean;
  onTyping: () => void;
  disabled: boolean;
}

const MessageInputSection = ({ 
  messageText, 
  setMessageText, 
  handleSendMessage, 
  handleFileUpload, 
  handleEndChat, 
  hasUserSentMessage, 
  onTyping, 
  disabled 
}: MessageInputSectionProps) => {
  return (
    <div className="border-t border-gray-100 bg-white bg-opacity-70 backdrop-blur-sm">
      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={onTyping}
        disabled={disabled}
      />
    </div>
  );
};

export default MessageInputSection;
