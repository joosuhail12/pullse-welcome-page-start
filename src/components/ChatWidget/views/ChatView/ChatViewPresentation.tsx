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
  searchMessages: Message[];
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
    if (showInlineForm && config?.preChatForm?.fields && config.preChatForm.fields.length > 0) {
      return (
        <div className="absolute inset-0 bg-white z-50">
          <PreChatForm
            fields={config.preChatForm.fields}
            onFormComplete={handleFormComplete}
          />
        </div>
      );
    }
    return null;
  }, [showInlineForm, config?.preChatForm, handleFormComplete]);

  return (
    <div className="h-full flex flex-col" style={chatViewStyle}>
      <ChatKeyboardHandler
        handleSendMessage={handleSendMessage}
        toggleSearch={toggleSearch}
      >
        <ChatViewHeader
          conversation={conversation}
          onBack={onBack}
          showSearch={showSearch}
          toggleSearch={toggleSearch}
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
          isTyping={isTyping}
          handleSendMessage={handleSendMessage}
          handleUserTyping={handleUserTyping}
          handleFileUpload={handleFileUpload}
          config={config}
        />
      </ChatKeyboardHandler>

      {config?.branding?.poweredBy && (
        <PoweredByBar
          config={config}
        />
      )}

      {isMobile && <KeyboardShortcutsInfo />}
    </div>
  );
};

export default ChatViewPresentation;
