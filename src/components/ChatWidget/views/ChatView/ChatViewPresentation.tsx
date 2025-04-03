import React, { useMemo } from 'react';
import { Conversation, Message } from '../../types';
import { ChatWidgetConfig } from '../../config';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Keyboard shortcuts help
  const keyboardShortcuts = [
    { key: 'Alt + /', description: 'Focus search' },
    { key: 'Alt + End', description: 'Scroll to latest messages' },
    { key: 'Alt + Home', description: 'Load older messages' },
    { key: 'Alt + Enter', description: 'Send message' },
    { key: 'Esc', description: 'Close search' }
  ];

  // Effect to add keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+/ to focus search
      if (e.altKey && e.key === '/' && showSearchFeature) {
        e.preventDefault();
        toggleSearch();
      }
      
      // Alt+Enter to send message
      if (e.altKey && e.key === 'Enter' && messageText.trim().length > 0) {
        e.preventDefault();
        handleSendMessage();
      }
      
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        e.preventDefault();
        toggleSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messageText, handleSendMessage, toggleSearch, showSearch, showSearchFeature]);

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

  const renderPoweredBy = () => {
    return (
      <div className="border-t border-gray-100 py-2 px-3 bg-white/90 backdrop-blur-sm flex items-center justify-center gap-1 text-xs text-gray-500">
        <span>Powered by</span>
        <img 
          src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
          alt="Pullse Logo" 
          className="h-4 w-auto"
        />
        <span className="font-medium">Pullse</span>
      </div>
    );
  };

  return (
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
      
      <div className="flex justify-end pr-3" aria-hidden="true">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="text-gray-500 p-1 hover:text-vivid-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-vivid-purple"
                aria-label="Keyboard shortcuts"
              >
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="p-2 max-w-xs">
              <div className="text-sm">
                <h3 className="font-semibold mb-1">Keyboard Shortcuts</h3>
                <ul className="space-y-1">
                  {keyboardShortcuts.map((shortcut, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{shortcut.key}</kbd>
                      <span>{shortcut.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {inlineFormComponent}
      
      <div className="flex flex-col flex-grow overflow-hidden">
        {(!showInlineForm || conversation.contactIdentified) && (
          <MessageList 
            messages={messages}
            isTyping={isTyping || remoteIsTyping}
            setMessageText={setMessageText}
            readReceipts={readReceipts}
            onMessageReaction={onMessageReaction}
            searchResults={messageIds}
            highlightMessage={highlightText}
            searchTerm={searchTerm}
            agentAvatar={agentAvatar}
            userAvatar={userAvatar}
            onScrollTop={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            conversationId={conversation.id}
            agentStatus={conversation.agentInfo?.status}
          />
        )}
        
        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          handleEndChat={handleEndChat}
          hasUserSentMessage={isTyping}
          onTyping={handleUserTyping}
          disabled={showInlineForm}
        />
        
        {renderPoweredBy()}
      </div>
    </div>
  );
};

export default ChatViewPresentation;
