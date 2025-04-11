
import React, { useMemo, useState, useEffect } from 'react';
import { Conversation, Message, AgentStatus } from '../../types';
import { ChatWidgetConfig } from '../../config';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';
import KeyboardShortcutsInfo, { KeyboardShortcutProps } from '../../components/KeyboardShortcutsInfo';
import ChatKeyboardHandler from '../../components/ChatKeyboardHandler';
import ChatBody from '../../components/ChatBody';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageReadStatus } from '../../components/MessageReadReceipt';
import MessageInput from '../../components/MessageInput';
import PoweredByBar from '../../components/PoweredByBar';
import { FormDataStructure } from '../../types';

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
  handleFormComplete: (formData: FormDataStructure) => void;
  config: ChatWidgetConfig;
  onToggleMessageImportance: (messageId: string) => void;
  ticketProgress: number;
  connectionStatus?: string;
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
  const [previousAgentStatus, setPreviousAgentStatus] = useState<AgentStatus | undefined>(conversation.agentInfo?.status);

  // Function to scroll to bottom - will be passed to keyboard handler
  const scrollToBottom = () => {
    const lastMessage = document.getElementById(`message-${messages[messages.length - 1]?.id}`);
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to adapt highlightText for use in ChatBody
  const adaptHighlightTextForChatBody = (text: string): string[] => {
    // Just return the text as an array with one element
    // This is a simplified version since we just need to pass this to ChatBody
    return [text];
  };

  // Track agent status changes
  useEffect(() => {
    const currentStatus = conversation.agentInfo?.status;

    if (currentStatus && currentStatus !== previousAgentStatus) {
      setPreviousAgentStatus(currentStatus);
    }
  }, [conversation.agentInfo?.status, previousAgentStatus]);

  const inlineFormComponent = useMemo(() => {
    if (showInlineForm) {
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

  // Custom keyboard shortcuts for this view
  const customShortcuts: KeyboardShortcutProps[] = [
    { key: 'Alt + /', description: 'Search messages', category: 'search' },
    { key: 'Alt + Enter', description: 'Send message', category: 'messages' },
    { key: 'Alt + End', description: 'Go to latest messages', category: 'navigation' },
    { key: 'Alt + Home', description: 'Load older messages', category: 'navigation' },
    { key: 'Esc', description: 'Close search/popups', category: 'general' },
  ];

  return (
    <div className="h-full flex flex-col" style={chatViewStyle}>
      <ChatKeyboardHandler
        handleSendMessage={handleSendMessage}
        toggleSearch={toggleSearch}
        messageText={messageText}
        showSearch={showSearch}
        showSearchFeature={showSearchFeature}
        scrollToBottom={scrollToBottom}
        loadOlderMessages={hasMoreMessages ? handleLoadMoreMessages : undefined}
      >
        <ChatViewHeader
          conversation={conversation}
          onBack={onBack}
          showSearch={showSearch}
          config={config}
          toggleSearch={toggleSearch}
          searchMessages={searchMessages}
          clearSearch={clearSearch}
          searchResultCount={searchResultCount}
          isSearching={isSearching}
          showSearchFeature={showSearchFeature}
          ticketProgress={ticketProgress}
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
          highlightMessage={adaptHighlightTextForChatBody}
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
          typingDuration={3000} // Add smart typing duration
          previousAgentStatus={previousAgentStatus} // Pass previous agent status
        />
      </ChatKeyboardHandler>

      {/* Use simple PoweredByBar without config prop */}
      {config?.interfaceSettings?.showBrandingBar !== false && (
        <PoweredByBar />
      )}

      {/* Enhanced keyboard shortcuts with customizable shortcuts */}
      <div className="absolute bottom-16 right-2">
        <KeyboardShortcutsInfo
          shortcuts={customShortcuts}
          compact={true}
        />
      </div>
    </div>
  );
};

export default ChatViewPresentation;
