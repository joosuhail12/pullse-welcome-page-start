
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Conversation, Message } from '../types';
import { useMessageActions } from '../hooks/useMessageActions';
import { useConversationData } from '../hooks/useConversationData';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useSearchMessages } from '../hooks/useSearchMessages';
import ChatHeader from '../components/ChatHeader';
import ChatBody from '../components/ChatBody';
import { ChatWidgetConfig } from '../config';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (conversation: Conversation) => void;
  config: ChatWidgetConfig;
  playMessageSound: () => void;
  userFormData?: Record<string, any>;
  setUserFormData: (data: Record<string, any>) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onBack,
  onUpdateConversation,
  config,
  playMessageSound,
  userFormData,
  setUserFormData
}) => {
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get message actions
  const {
    handleSendMessage,
    handleFileUpload,
    handleUserTyping,
    handleEndChat,
    fileError
  } = useMessageActions(conversation, onUpdateConversation, config, playMessageSound);
  
  // Get conversation data
  const {
    messages,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    showInlineForm,
    inlineFormComponent,
    messageReactions,
    readReceipts,
  } = useConversationData(conversation, config, userFormData, setUserFormData);
  
  // Get typing indicators
  const { handleTypingTimeout, clearTypingTimeout } = useTypingIndicator();
  const isTyping = false; // Placeholder - would come from state
  const remoteIsTyping = false; // Placeholder - would come from state
  
  // Get search functionality
  const { searchMessages, messageIds, highlightTextWithTerm } = useSearchMessages(messages);
  
  // Handle sending a message
  const sendMessageHandler = useCallback(() => {
    if (messageText.trim()) {
      handleSendMessage(messageText);
      setMessageText('');
      setIsComposing(false);
    }
  }, [messageText, handleSendMessage]);
  
  // Handle file upload
  const fileUploadHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(e);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload]);
  
  // Handle user typing
  const handleUserTypingCallback = useCallback(() => {
    setIsComposing(true);
    handleUserTyping();
  }, [handleUserTyping]);
  
  // Handle search term change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    searchMessages(e.target.value);
  }, [searchMessages]);
  
  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchTerm('');
      searchMessages('');
    }
  }, [showSearchBar, searchMessages]);
  
  // Get agent status if available
  const agentStatus = useMemo(() => {
    if (conversation.agentInfo) {
      return conversation.agentInfo.status as 'online' | 'offline' | 'away' | 'busy' | undefined;
    }
    return undefined;
  }, [conversation.agentInfo]);
  
  // Adaptation function for highlighting text
  const highlightTextAdapter = useCallback((text: string) => {
    return highlightTextWithTerm(text, searchTerm);
  }, [highlightTextWithTerm, searchTerm]);
  
  return (
    <>
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onToggleSearch={toggleSearch}
        showSearch={showSearchBar}
      />
      
      <ChatBody
        messages={messages}
        messageText={messageText}
        setMessageText={setMessageText}
        isTyping={isTyping}
        remoteIsTyping={remoteIsTyping}
        handleSendMessage={sendMessageHandler}
        handleUserTyping={handleUserTypingCallback}
        handleFileUpload={fileUploadHandler}
        handleEndChat={handleEndChat}
        readReceipts={readReceipts}
        onMessageReaction={messageReactions.onMessageReaction}
        searchTerm={searchTerm}
        messageIds={messageIds}
        highlightText={highlightTextAdapter}
        agentAvatar={config.branding?.avatarUrl}
        userAvatar={userFormData?.avatar}
        handleLoadMoreMessages={loadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMore={isLoadingMore}
        showInlineForm={showInlineForm}
        inlineFormComponent={inlineFormComponent}
        conversationId={conversation.id}
        agentStatus={agentStatus}
        onToggleHighlight={(messageId) => searchMessages(searchTerm, [messageId])}
      />
    </>
  );
};

export default ChatView;
