
import React, { useState } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import SearchBar from '../components/SearchBar';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';

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
  const [showSearch, setShowSearch] = useState(false);

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

  // Add message reactions
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    message => setMessages(message),
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  // Add message search
  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useMessageSearch(messages);

  // Function to share messages state with parent components
  const setMessages = (updatedMessages: React.SetStateAction<typeof messages>) => {
    if (typeof updatedMessages === 'function') {
      const newMessages = updatedMessages(messages);
      onUpdateConversation({
        ...conversation,
        messages: newMessages
      });
    } else {
      onUpdateConversation({
        ...conversation,
        messages: updatedMessages
      });
    }
  };

  // Toggle search bar
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onToggleSearch={toggleSearch}
        showSearch={showSearch}
      />
      
      {showSearch && config?.features?.searchMessages && (
        <SearchBar 
          onSearch={searchMessages} 
          onClear={clearSearch} 
          resultCount={messageIds.length}
          isSearching={isSearching}
        />
      )}
      
      <MessageList 
        messages={messages}
        isTyping={isTyping || remoteIsTyping}
        setMessageText={setMessageText}
        readReceipts={readReceipts}
        onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
        searchResults={messageIds}
        highlightMessage={highlightText}
        searchTerm={searchTerm}
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
