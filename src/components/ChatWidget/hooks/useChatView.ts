
import { useMemo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { useChatMessages } from './useChatMessages';
import { useMessageReactions } from './useMessageReactions';
import { useChatSearch } from './useChatSearch';
import { useChatFormHandling } from './useChatFormHandling';
import { useChatAvatars } from './useChatAvatars';

interface UseChatViewProps {
  conversation: Conversation;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

export function useChatView({
  conversation,
  onUpdateConversation,
  config,
  playMessageSound,
  userFormData,
  setUserFormData
}: UseChatViewProps) {
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

  // Use the search functionality hook with messages
  const {
    showSearch,
    toggleSearch,
    searchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useChatSearch(messages);
  
  // Use the form handling hook
  const {
    showPreChatForm,
    handleFormComplete,
    isProcessingForm
  } = useChatFormHandling({
    conversation,
    config,
    userFormData,
    setUserFormData,
    onUpdateConversation
  });

  // Use avatar hooks
  const { agentAvatar, userAvatar } = useChatAvatars(conversation, config);

  // Message reactions hook
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    (updatedMessages) => {
      onUpdateConversation({
        ...conversation,
        messages: typeof updatedMessages === 'function' 
          ? updatedMessages(conversation.messages || []) 
          : updatedMessages
      });
    },
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  // Determine if there could be more messages to load
  const hasMoreMessages = useMemo(() => 
    messages.length >= 20, 
    [messages.length]
  );

  // Create a wrapper around loadPreviousMessages for better error handling
  const handleLoadMoreMessages = async () => {
    if (!loadPreviousMessages) return;
    
    try {
      await loadPreviousMessages();
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  };

  return {
    showSearch,
    toggleSearch,
    showPreChatForm,
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
    handleMessageReaction,
    searchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching,
    agentAvatar,
    userAvatar,
    handleLoadMoreMessages,
    handleFormComplete,
    hasMoreMessages,
    isLoadingMore,
    isProcessingForm
  };
}
