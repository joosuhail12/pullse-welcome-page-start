
import React from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { useChatMessages } from '../hooks/useChatMessages';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
}

const ChatView = ({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config,
  playMessageSound
}: ChatViewProps) => {
  const {
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  return (
    <div className="flex flex-col h-[600px]">
      <ChatHeader conversation={conversation} onBack={onBack} />
      <MessageList 
        messages={messages}
        isTyping={isTyping || remoteIsTyping}
        setMessageText={setMessageText}
        readReceipts={readReceipts}
      />
      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
      />
    </div>
  );
};

export default ChatView;
