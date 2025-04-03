
// Update ChatViewPresentation to pass down offline-related props
import React, { useEffect, useMemo } from 'react';
import { Conversation, Message } from '../../types';
import { ConnectionStatus } from '../../utils/reconnectionManager';
import { ChatWidgetConfig } from '../../config';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';
import KeyboardShortcutsInfo, { KeyboardShortcutProps } from '../../components/KeyboardShortcutsInfo';
import ChatKeyboardHandler from '../../components/ChatKeyboardHandler';
import ChatBody from '../../components/ChatBody';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { CloudSunIcon, NetworkIcon } from 'lucide-react';

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
  readReceipts: Record<string, { status: any; timestamp?: Date }>;
  onBack: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
  searchMessages: (term: string) => void;
  clearSearch: () => void;
  searchResultCount: number;
  isSearching: boolean;
  showSearchFeature?: boolean;
  highlightText: (text: string) => { text: string; highlighted: boolean }[];
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
  onToggleMessageImportance?: (messageId: string) => void;
  ticketProgress?: number;
  connectionStatus?: ConnectionStatus;
  hasDraft?: boolean;
  pendingCount?: number;
  onSaveDraft?: (text: string) => void;
  onLoadDraft?: () => string;
  onSyncPendingMessages?: () => Promise<void>;
  isSyncing?: boolean;
  isOffline?: boolean;
  customKeyboardShortcuts?: KeyboardShortcutProps[];
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
  connectionStatus = ConnectionStatus.CONNECTED,
  hasDraft = false,
  pendingCount = 0,
  onSaveDraft,
  onLoadDraft,
  onSyncPendingMessages,
  isSyncing = false,
  isOffline = false,
  customKeyboardShortcuts = []
}: ChatViewPresentationProps) => {
  const isMobile = useIsMobile();
  
  // Prepare the inline form component if needed
  const inlineFormComponent = useMemo(() => {
    if (showInlineForm) {
      return (
        <div className="flex-shrink-0">
          <PreChatForm
            onFormComplete={handleFormComplete}
            fields={config.preChatForm?.fields}
            config={config}
          />
        </div>
      );
    }
    return null;
  }, [showInlineForm, config, handleFormComplete]);

  // Check if we need to show the sync button for pending messages
  const showSyncButton = pendingCount > 0 && 
                         connectionStatus === ConnectionStatus.CONNECTED && 
                         onSyncPendingMessages && 
                         !isSyncing;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={chatViewStyle}>
      <ChatViewHeader
        conversation={conversation}
        onBack={onBack}
        showSearch={showSearch}
        onToggleSearch={toggleSearch}
        searchTerm={searchTerm}
        onSearch={searchMessages}
        onClearSearch={clearSearch}
        searchResultCount={searchResultCount}
        isSearching={isSearching}
        showSearchFeature={showSearchFeature}
        agentStatus={conversation.agentInfo?.status}
        agentName={conversation.agentInfo?.name}
        agentAvatar={conversation.agentInfo?.avatar}
        ticketProgress={ticketProgress}
      />

      {/* Sync pending messages button */}
      {showSyncButton && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
          <span className="text-sm text-amber-800">
            {pendingCount} unsent message{pendingCount !== 1 ? 's' : ''}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
            onClick={onSyncPendingMessages}
            disabled={isSyncing}
          >
            <NetworkIcon className="h-4 w-4 mr-2" />
            Sync now
          </Button>
        </div>
      )}

      {/* Show sync in progress indicator */}
      {isSyncing && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex justify-center items-center">
          <span className="flex items-center text-sm text-blue-800">
            <CloudSunIcon className="h-4 w-4 mr-2 animate-spin" />
            Syncing messages...
          </span>
        </div>
      )}

      <ChatKeyboardHandler 
        onSendMessage={handleSendMessage}
        toggleSearch={toggleSearch}
        showSearchFeature={showSearchFeature}
        customShortcuts={customKeyboardShortcuts as any}
        onSyncMessages={onSyncPendingMessages}
      >
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
          highlightMessage={(text) => highlightText(text).map(part => part.text)}
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
          typingDuration={3000}
          connectionStatus={connectionStatus}
          hasDraft={hasDraft}
          pendingCount={pendingCount}
          onSaveDraft={onSaveDraft}
          onLoadDraft={onLoadDraft}
        />
      </ChatKeyboardHandler>
    </div>
  );
};

export default ChatViewPresentation;
