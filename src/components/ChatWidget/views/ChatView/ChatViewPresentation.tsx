
import React, { useMemo } from 'react';
import { Conversation } from '../../types';
import { ChatWidgetConfig } from '../../config';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';
import KeyboardShortcutsInfo from '../../components/KeyboardShortcutsInfo';
import ChatKeyboardHandler from '../../components/ChatKeyboardHandler';
import ChatBody from '../../components/ChatBody';

interface ChatViewPresentationProps {
  conversation: Conversation;
  chatViewStyle: React.CSSProperties;
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  isTyping: boolean;
  remoteIsTyping: boolean;
  handleSendMessage: () => void;
  handleUserTyping: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  readReceipts: Record<string, Date>;
  onBack: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
  searchMessages: (term: string) => void;
  clearSearch: () => void;
  searchResultCount: number;
  isSearching: boolean;
  showSearchFeature: boolean;
  highlightText: (text: string, term: string) => { text: string; highlighted: boolean }[];
  messageIds: string[];
  searchTerm: string;
  agentAvatar?: string;
  userAvatar?: string;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  handleLoadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  showInlineForm: boolean;
  handleFormComplete: (formData: Record<string, string>) => void;
  config: ChatWidgetConfig;
}

/**
 * Presentational component that renders the UI for the chat view
 * This component doesn't contain any logic, it just renders the UI
 * based on the props it receives
 */
const ChatViewPresentation: React.FC<ChatViewPresentationProps> = ({ 
  conversation,
  chatViewStyle,
  messages,
  messageText,
  setMessageText,
  isTyping,
  remoteIsTyping,
  handleSendMessage,
  handleUserTyping,
  handleFileUpload,
  handleEndChat,
  readReceipts,
  onBack,
  showSearch,
  toggleSearch,
  searchMessages,
  clearSearch,
  searchResultCount,
  isSearching,
  showSearchFeature,
  highlightText,
  messageIds,
  searchTerm,
  agentAvatar,
  userAvatar,
  onMessageReaction,
  handleLoadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  showInlineForm,
  handleFormComplete,
  config
}) => {
  const inlineFormComponent = useMemo(() => {
    if (showInlineForm) {
      return (
        <div className="mb-4">
          <PreChatForm config={config} onFormComplete={handleFormComplete} />
        </div>
      );
    }
    return null;
  }, [showInlineForm, config, handleFormComplete]);

  return (
    <ChatKeyboardHandler
      messageText={messageText}
      handleSendMessage={handleSendMessage}
      toggleSearch={toggleSearch}
      showSearch={showSearch}
      showSearchFeature={showSearchFeature}
    >
      <div 
        className="flex flex-col h-[600px] bg-gradient-to-br from-soft-purple-50 to-soft-purple-100 rounded-lg shadow-lg"
        style={chatViewStyle}
        role="region" 
        aria-label="Chat conversation"
      >
        <ChatViewHeader 
          conversation={conversation} 
          onBack={onBack}
          showSearch={showSearch}
          toggleSearch={toggleSearch}
          searchMessages={searchMessages}
          clearSearch={clearSearch}
          searchResultCount={searchResultCount}
          isSearching={isSearching}
          showSearchFeature={showSearchFeature}
        />
        
        <KeyboardShortcutsInfo />
        
        <ChatBody 
          messages={messages}
          messageText={messageText}
          setMessageText={setMessageText}
          isTyping={isTyping}
          remoteIsTyping={remoteIsTyping}
          handleSendMessage={handleSendMessage}
          handleUserTyping={handleUserTyping}
          handleFileUpload={handleFileUpload}
          handleEndChat={handleEndChat}
          readReceipts={readReceipts}
          onMessageReaction={onMessageReaction}
          searchTerm={searchTerm}
          messageIds={messageIds}
          highlightText={highlightText}
          agentAvatar={agentAvatar}
          userAvatar={userAvatar}
          handleLoadMoreMessages={handleLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          showInlineForm={showInlineForm}
          inlineFormComponent={inlineFormComponent}
          conversationId={conversation.id}
          agentStatus={conversation.agentInfo?.status}
        />
      </div>
    </ChatKeyboardHandler>
  );
};

export default ChatViewPresentation;
