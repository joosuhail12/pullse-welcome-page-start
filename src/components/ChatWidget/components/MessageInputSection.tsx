
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
  config?: any; // For future theming options
}

const MessageInputSection = ({ 
  messageText, 
  setMessageText, 
  handleSendMessage, 
  handleFileUpload, 
  handleEndChat, 
  hasUserSentMessage, 
  onTyping, 
  disabled,
  config
}: MessageInputSectionProps) => {
  // Apply custom styling based on config if provided
  const borderStyle = config?.branding?.theme === 'dark' 
    ? 'border-gray-700' 
    : 'border-gray-100';
  
  const bgStyle = config?.branding?.theme === 'dark'
    ? 'bg-gray-900 bg-opacity-70'
    : 'bg-white bg-opacity-70';
  
  return (
    <div className={`border-t ${borderStyle} ${bgStyle} backdrop-blur-sm`}>
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
