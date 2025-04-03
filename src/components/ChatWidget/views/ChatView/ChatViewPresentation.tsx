
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
import DateSeparator from '../../components/DateSeparator';

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
    if (!text) return [''];
    if (!searchTerm) return [text];
    
    // Use the highlightText function if available, otherwise implement a simple version
    if (typeof highlightText === 'function') {
      return highlightText(text);
    }
    
    // Simple fallback implementation
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex);
  };

  // Track agent status changes
  useEffect(() => {
    const currentStatus = conversation.agentInfo?.status;
    
    if (currentStatus && currentStatus !== previousAgentStatus) {
      setPreviousAgentStatus(currentStatus);
    }
  }, [conversation.agentInfo?.status, previousAgentStatus]);

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
  
  // Custom keyboard shortcuts for this view
  const customShortcuts: KeyboardShortcutProps[] = [
    { key: 'Alt + /', description: 'Search messages', category: 'search' },
    { key: 'Alt + Enter', description: 'Send message', category: 'messages' },
    { key: 'Alt + End', description: 'Go to latest messages', category: 'navigation' },
    { key: 'Alt + Home', description: 'Load older messages', category: 'navigation' },
    { key: 'Esc', description: 'Close search/popups', category: 'general' },
  ];

  // Generate CSS variables for branding
  const generateBrandStyles = useMemo(() => {
    const brandColor = config?.branding?.primaryColor || '#8B5CF6';
    
    // Parse the brand color to create a color scheme
    let style: React.CSSProperties = {
      '--vivid-purple': brandColor,
      '--chat-header-bg': brandColor,
      '--chat-header-text': '#ffffff',
      '--user-bubble-bg': brandColor,
      '--user-bubble-text': '#ffffff',
      '--system-bubble-bg': '#F8F7FF',
      '--system-bubble-text': '#1f2937',
    } as React.CSSProperties;
    
    // Merge with any existing styles
    return { ...chatViewStyle, ...style };
  }, [config?.branding?.primaryColor, chatViewStyle]);

  return (
    <div className="h-full flex flex-col chat-scroll-area" style={generateBrandStyles}>
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
      {config?.branding?.showBrandingBar !== false && (
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
