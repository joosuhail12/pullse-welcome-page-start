
import React, { useCallback } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import MessageInputSection from '../components/MessageInputSection';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatFormSection from '../components/PreChatFormSection';
import MessagesSection from '../components/MessagesSection';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { usePreChatForm } from '../hooks/usePreChatForm';
import { dispatchChatEvent } from '../utils/events';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

const ChatView = ({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}: ChatViewProps) => {
  const [showSearch, setShowSearch] = React.useState(false);
  
  // Use the pre-chat form hook
  const { showPreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Chat messages hook
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
    readReceipts,
    loadPreviousMessages,
    isLoadingMore
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  // Message reactions hook
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    message => setMessages(message),
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  // Message search hook
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

  // Handle loading previous messages for infinite scroll
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    try {
      await loadPreviousMessages();
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  }, [loadPreviousMessages]);

  // Handle form submission
  const handleFormComplete = (formData: Record<string, string>) => {
    // Update the parent form data if callback exists
    if (setUserFormData) {
      setUserFormData(formData);
    }
    
    // Flag the conversation as having identified the contact
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
    
    // Dispatch form completed event
    dispatchChatEvent('contact:formCompleted', { formData }, config);
  };

  // Get avatar URLs from config
  const agentAvatar = conversation.agentInfo?.avatar || config?.branding?.avatarUrl;
  const userAvatar = undefined; // Could be set from user profile if available

  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Simplified check for more messages

  return (
    <div 
      className="flex flex-col h-[600px] bg-gradient-to-b from-gray-50 to-white"
      style={{
        // Apply custom theme variables if available from config
        ...(config?.branding?.primaryColor && {
          '--chat-header-bg': config.branding.primaryColor,
          '--chat-header-text': '#ffffff',
          '--user-bubble-bg': config.branding.primaryColor,
          '--user-bubble-text': '#ffffff',
          '--system-bubble-bg': '#f3f4f6',
          '--system-bubble-text': '#1f2937',
          '--chat-bg': '#ffffff',
        } as React.CSSProperties)
      }}
    >
      <ChatViewHeader 
        conversation={conversation} 
        onBack={onBack}
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        searchMessages={searchMessages}
        clearSearch={clearSearch}
        searchResultCount={messageIds.length}
        isSearching={isSearching}
        showSearchFeature={!!config?.features?.searchMessages}
      />
      
      {showPreChatForm ? (
        <PreChatFormSection 
          config={config} 
          onFormComplete={handleFormComplete} 
        />
      ) : (
        <MessagesSection 
          messages={messages}
          isTyping={isTyping}
          remoteIsTyping={remoteIsTyping}
          setMessageText={setMessageText}
          readReceipts={readReceipts}
          onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
          searchResults={messageIds}
          highlightMessage={highlightText}
          searchTerm={searchTerm}
          agentAvatar={agentAvatar}
          userAvatar={userAvatar}
          onScrollTop={handleLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMore}
        />
      )}
      
      <MessageInputSection
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
        disabled={showPreChatForm}
      />
    </div>
  );
};

export default ChatView;
