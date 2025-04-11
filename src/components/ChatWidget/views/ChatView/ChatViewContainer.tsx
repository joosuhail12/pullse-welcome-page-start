
import React, { useState, useEffect, useCallback } from 'react';
import { ChatViewPresentation } from './ChatViewPresentation';
import { type Conversation, type Message } from '../../types';
import { useMessageReactions } from '../../hooks/useMessageReactions';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import { useRealTime } from '../../hooks/useRealTime';
import { useAblyChannels } from '../../hooks/useAblyChannels';
import { ChatWidgetConfig } from '../../config';

interface ChatViewContainerProps {
  conversation: Conversation;
  onBackClick: () => void;
  onUpdateConversation: (conversation: Conversation) => void;
  config: ChatWidgetConfig;
  playMessageSound?: () => void;
  setUserFormData: (formData: Record<string, string>) => void;
  userFormData?: Record<string, string>;
}

export const ChatViewContainer: React.FC<ChatViewContainerProps> = ({
  conversation,
  onBackClick,
  onUpdateConversation,
  config,
  playMessageSound,
  setUserFormData,
  userFormData
}) => {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  // Subscribe to conversation-specific Ably channel using ticketId
  useAblyChannels(conversation.ticketId);

  // Check if the user has sent any messages in this conversation
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    setHasUserSentMessage(userMessages.length > 0);
  }, [messages]);

  // Update the parent component's copy of the conversation when messages change
  useEffect(() => {
    const updatedConversation = {
      ...conversation,
      messages: messages,
      // Update lastMessage if there are messages
      lastMessage: messages.length > 0 ? messages[messages.length - 1].text : conversation.lastMessage
    };
    onUpdateConversation(updatedConversation);
  }, [messages, conversation, onUpdateConversation]);

  const { 
    remoteIsTyping, 
    chatChannelName, 
    handleTypingTimeout
  } = useRealTime(
    messages,
    setMessages,
    conversation,
    hasUserSentMessage,
    setIsTyping,
    config,
    playMessageSound
  );

  // Combine local and remote typing indicators
  const isAnyoneTyping = isTyping || remoteIsTyping;

  // Use message actions hook for sending and handling messages
  const { 
    sendMessage, 
    sendTypingStatus, 
    uploadFile, 
    endConversation,
    reactToMessage,
    messagesContainerRef
  } = useMessageActions(
    messages,
    setMessages,
    conversation,
    chatChannelName,
    config,
    handleTypingTimeout,
    playMessageSound
  );

  // Use message reactions hook
  const { 
    handleReaction, 
    reactionsEnabled 
  } = useMessageReactions(
    messages, 
    setMessages, 
    chatChannelName, 
    reactToMessage, 
    config
  );

  // Use message search hook
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    currentMatchIndex, 
    totalMatches, 
    jumpToNextMatch, 
    jumpToPrevMatch,
    clearSearch
  } = useMessageSearch(messages, messagesContainerRef);

  return (
    <ChatViewPresentation
      messages={messages}
      isTyping={isAnyoneTyping}
      onSendMessage={sendMessage}
      onTypingChange={sendTypingStatus}
      onBackClick={onBackClick}
      onUploadFile={uploadFile}
      onEndConversation={endConversation}
      onReactToMessage={handleReaction}
      messagesContainerRef={messagesContainerRef}
      conversation={conversation}
      config={config}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      searchResults={searchResults}
      currentMatchIndex={currentMatchIndex}
      totalMatches={totalMatches}
      jumpToNextMatch={jumpToNextMatch}
      jumpToPrevMatch={jumpToPrevMatch}
      clearSearch={clearSearch}
      reactionsEnabled={reactionsEnabled}
      hasUserSentMessage={hasUserSentMessage}
      setUserFormData={setUserFormData}
      userFormData={userFormData}
    />
  );
};
