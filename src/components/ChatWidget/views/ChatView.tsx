
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Conversation, Message, MessageReadStatus } from '../types';
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
    sendMessage,
    sendFileMessage,
    handleUserTyping,
    endChat
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
  const { isTyping, remoteIsTyping } = useTypingIndicator(conversation.id, isComposing);
  
  // Get search functionality
  const { searchMessages, messageIds, highlightTextWithTerm } = useSearchMessages(messages);
  
  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
      setIsComposing(false);
    }
  }, [messageText, sendMessage]);
  
  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      sendFileMessage(file);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [sendFileMessage]);
  
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
  
  // Get agent status if available
  const agentStatus = useMemo(() => {
    if (conversation.participants && conversation.participants.length > 0) {
      const agent = conversation.participants.find(p => p.id !== 'user');
      return agent?.metadata?.status as 'online' | 'offline' | 'away' | 'busy' | undefined;
    }
    return undefined;
  }, [conversation.participants]);
  
  // Format read receipts to match the expected type
  const formattedReadReceipts: Record<string, { status: MessageReadStatus; timestamp?: Date }> = useMemo(() => {
    const result: Record<string, { status: MessageReadStatus; timestamp?: Date }> = {};
    
    // Convert string statuses to MessageReadStatus type
    if (readReceipts) {
      Object.keys(readReceipts).forEach(messageId => {
        const receipt = readReceipts[messageId];
        if (typeof receipt === 'object') {
          if ('status' in receipt) {
            const status = receipt.status as MessageReadStatus;
            result[messageId] = {
              status,
              timestamp: receipt.timestamp
            };
          } else if (receipt instanceof Date) {
            result[messageId] = {
              status: 'read', // Default to 'read' for Date objects
              timestamp: receipt
            };
          }
        }
      });
    }
    
    return result;
  }, [readReceipts]);
  
  // Adaptation function for highlighting text
  const highlightTextAdapter = useCallback((text: string) => {
    return highlightTextWithTerm(text, searchTerm);
  }, [highlightTextWithTerm, searchTerm]);
  
  return (
    <>
      <ChatHeader
        conversationTitle={conversation.title}
        onBack={onBack}
        onSearch={() => setShowSearchBar(!showSearchBar)}
        onEndChat={endChat}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showSearchBar={showSearchBar}
      />
      
      <ChatBody
        messages={messages}
        messageText={messageText}
        setMessageText={setMessageText}
        isTyping={isTyping}
        remoteIsTyping={remoteIsTyping}
        handleSendMessage={handleSendMessage}
        handleUserTyping={handleUserTypingCallback}
        handleFileUpload={handleFileUpload}
        handleEndChat={endChat}
        readReceipts={formattedReadReceipts}
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
