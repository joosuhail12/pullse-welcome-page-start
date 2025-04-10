
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Conversation, FormDataStructure } from '../types';
import { ChatWidgetConfig } from '../config';
import ChatViewHeader from '../components/ChatViewHeader';
import ChatBody from '../components/ChatBody';
import MessageInput from '../components/MessageInput';
import LoadingIndicator from '../components/LoadingIndicator';
import PreChatForm from '../components/PreChatForm';
import { useChatMessages } from '../hooks/useChatMessages';
import { useInlineForm } from '../hooks/useInlineForm';
import { useSound } from '../hooks/useSound';
import { useSearchToggle } from '../hooks/useSearchToggle';
import SearchBar from '../components/SearchBar';
import { useMessageSearch } from '../hooks/useMessageSearch';
import KeyboardShortcutsInfo from '../components/KeyboardShortcutsInfo';
import ChatKeyboardHandler from '../components/ChatKeyboardHandler';
import AgentPresence from '../components/AgentPresence';
import StatusChangeNotification from '../components/StatusChangeNotification';
import TicketProgressBar from '../components/TicketProgressBar';
import EstimatedResponseTime from '../components/EstimatedResponseTime';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound: () => void;
  userFormData?: Record<string, string>;
  setUserFormData: (data: Record<string, string>) => void;
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
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showShortcutsInfo, setShowShortcutsInfo] = useState<boolean>(false);
  const [showStatusNotification, setShowStatusNotification] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'away'>('online');
  const messageListRef = useRef<HTMLDivElement>(null);

  // Initialize the message sound
  const { playSound } = useSound();

  // Use the message search hook
  const { 
    searchTerm, 
    setSearchTerm,
    searchResults,
    currentMatchIndex,
    totalMatches,
    handlePrevMatch,
    handleNextMatch,
    highlightedMessageId
  } = useMessageSearch(conversation.messages || []);

  // Use the search toggle hook
  const { 
    isSearchVisible, 
    toggleSearch, 
    handleSearchKeyDown,
    searchInputRef
  } = useSearchToggle(() => setSearchTerm(''));

  // Use the chat messages hook
  const {
    messages,
    messageText,
    setMessageText,
    isTyping,
    remoteIsTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    readReceipts,
    loadPreviousMessages
  } = useChatMessages(
    conversation,
    config,
    onUpdateConversation,
    playMessageSound
  );

  // Handle the inline form visibility and submission
  const handleFormComplete = (formData: FormDataStructure) => {
    setUserFormData(formData as Record<string, string>);
  };
  
  // Use the inline form hook
  const {
    showInlineForm,
    setShowInlineForm,
    handleFormComplete: handleInlineFormComplete
  } = useInlineForm(
    conversation,
    config || { workspaceId: '', widgetfield: { contactFields: [], companyFields: [], customDataFields: [] } },
    userFormData,
    setUserFormData,
    onUpdateConversation
  );

  // Show header information based on configuration
  const showAgentPresence = config?.interfaceSettings?.showAgentPresence !== false;
  const showTicketProgress = config?.interfaceSettings?.showTicketStatusBar !== false;
  const enableEndChat = config?.interfaceSettings?.allowVisitorsToEndChat !== false;

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatKeyboardHandler
        onToggleSearch={toggleSearch}
        onToggleShortcuts={() => setShowShortcutsInfo(prev => !prev)}
        isSearchVisible={isSearchVisible}
        messages={messages}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        isInputDisabled={showInlineForm}
      />

      <ChatViewHeader 
        title={conversation.title}
        onBack={onBack}
        onSearch={toggleSearch}
        onEndChat={enableEndChat ? handleEndChat : undefined}
      />

      {showAgentPresence && (
        <AgentPresence 
          agent={conversation.agentInfo}
          onStatusChange={(status) => {
            setAgentStatus(status as 'online' | 'offline' | 'away');
            setShowStatusNotification(true);
            setTimeout(() => setShowStatusNotification(false), 3000);
          }}
        />
      )}

      {showTicketProgress && conversation.metadata?.ticketProgress !== undefined && (
        <TicketProgressBar 
          progress={conversation.metadata.ticketProgress} 
          status={conversation.status === 'ended' ? 'resolved' : 'in-progress'}
        />
      )}

      {isSearchVisible && (
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentMatch={currentMatchIndex + 1}
          totalMatches={totalMatches}
          onPrevMatch={handlePrevMatch}
          onNextMatch={handleNextMatch}
          onClose={toggleSearch}
          inputRef={searchInputRef}
          onKeyDown={handleSearchKeyDown}
        />
      )}

      <AnimatePresence>
        {showStatusNotification && (
          <StatusChangeNotification 
            status={agentStatus}
            onClose={() => setShowStatusNotification(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-grow overflow-hidden relative">
        {showInlineForm ? (
          <div className="h-full p-4 overflow-y-auto">
            <PreChatForm
              onSubmit={handleInlineFormComplete}
              config={config}
            />
          </div>
        ) : (
          <ChatBody
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping || remoteIsTyping}
            onLoadPrevious={loadPreviousMessages}
            highlightedMessageId={highlightedMessageId}
            searchTerm={searchTerm}
            searchResults={searchResults}
            ref={messageListRef}
            userAvatar={config?.brandAssets?.avatarUrl || ''}
            agentAvatar={conversation.agentInfo?.avatar || ''}
            agentStatus={conversation.agentInfo?.status}
            readReceipts={readReceipts}
          />
        )}

        {agentStatus === 'online' && !showInlineForm && (
          <div className="absolute bottom-0 w-full px-4 pb-1">
            <EstimatedResponseTime responseTime="typically within 5 minutes" />
          </div>
        )}
      </div>

      {!showInlineForm && (
        <MessageInput
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleUserTyping();
          }}
          onSend={handleSendMessage}
          onFileUpload={handleFileUpload}
          placeholder="Type your message..."
          disabled={conversation.status === 'ended'}
          showFileUpload={config?.features?.fileUpload !== false}
          showEmojiPicker
        />
      )}

      <AnimatePresence>
        {showShortcutsInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 right-0 z-50"
          >
            <KeyboardShortcutsInfo onClose={() => setShowShortcutsInfo(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatView;
