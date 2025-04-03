
import React, { useMemo } from 'react';
import { Conversation, Message } from '../../types';
import { ChatWidgetConfig } from '../../config';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';
import KeyboardShortcutsInfo from '../../components/KeyboardShortcutsInfo';
import ChatKeyboardHandler from '../../components/ChatKeyboardHandler';
import ChatBody from '../../components/ChatBody';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageReadStatus } from '../../components/MessageReadReceipt';
import MessageInput from '../../components/MessageInput';
import PoweredByBar from '../../components/PoweredByBar';

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
  readReceipts: Record<string, { status: MessageReadStatus; timestamp?: Date }>;
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
  onMessageReaction?: (messageId: string, reaction: string) => void;
  handleLoadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  showInlineForm: boolean;
  handleFormComplete: (formData: Record<string, string>) => void;
  config: ChatWidgetConfig;
  onToggleMessageImportance: (messageId: string) => void;
  ticketProgress: number;
}

const ChatViewPresentation = ({
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
  config,
  onToggleMessageImportance,
  ticketProgress,
}: ChatViewPresentationProps) => {
  const isMobile = useIsMobile();

  const inlineFormComponent = useMemo(() => {
    if (showInlineForm && config?.preChatForm) {
      return (
        <div className="absolute inset-0 bg-white z-50">
          <PreChatForm
            config={config}
            onFormComplete={handleFormComplete}
          />
        </div>
      );
    }
    return null;
  }, [showInlineForm, config, handleFormComplete]);

  return (
    <div className="h-full flex flex-col" style={chatViewStyle}>
      <ChatKeyboardHandler
        handleSendMessage={handleSendMessage}
        toggleSearch={toggleSearch}
        messageText={messageText}
        showSearch={showSearch}
        showSearchFeature={showSearchFeature}
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
          onToggleHighlight={onToggleMessageImportance}
        />

        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          handleEndChat={handleEndChat}
          hasUserSentMessage={true}
          onTyping={handleUserTyping}
          disabled={showInlineForm}
          config={config}
        />
      </ChatKeyboardHandler>

      {config?.branding?.showBrandingBar !== false && (
        <PoweredByBar config={config} />
      )}

      {isMobile && <KeyboardShortcutsInfo />}
    </div>
  );
};

export default ChatViewPresentation;
