
import React, { useEffect, useState } from 'react';
import { Message } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PoweredByBar from './PoweredByBar';
import { MessageReadStatus } from './MessageReadReceipt';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import { ConnectionStatus } from '../utils/reconnectionManager';

interface ChatBodyProps {
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
  onMessageReaction?: (messageId: string, reaction: string) => void;
  searchTerm: string;
  messageIds: string[];
  highlightMessage: (text: string) => string[];
  agentAvatar?: string;
  userAvatar?: string;
  handleLoadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  showInlineForm: boolean;
  inlineFormComponent: React.ReactNode;
  conversationId: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
  onToggleHighlight?: (messageId: string) => void;
  typingDuration?: number;
  connectionStatus?: ConnectionStatus;
  hasDraft?: boolean;
  pendingCount?: number;
  onSaveDraft?: (text: string) => void;
  onLoadDraft?: () => string;
}

const ChatBody: React.FC<ChatBodyProps> = ({
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
  onMessageReaction,
  searchTerm,
  messageIds,
  highlightMessage,
  agentAvatar,
  userAvatar,
  handleLoadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  showInlineForm,
  inlineFormComponent,
  conversationId,
  agentStatus,
  onToggleHighlight,
  typingDuration = 0,
  connectionStatus = ConnectionStatus.CONNECTED,
  hasDraft = false,
  pendingCount = 0,
  onSaveDraft,
  onLoadDraft
}) => {
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [calculatedTypingDuration, setCalculatedTypingDuration] = useState(typingDuration);
  
  // Track how long typing has been active
  useEffect(() => {
    if (remoteIsTyping && !typingStartTime) {
      setTypingStartTime(Date.now());
    } else if (!remoteIsTyping && typingStartTime) {
      setTypingStartTime(null);
      setCalculatedTypingDuration(0);
    }
  }, [remoteIsTyping, typingStartTime]);
  
  // Update typing duration while typing is active
  useEffect(() => {
    if (!typingStartTime) return;
    
    const intervalId = setInterval(() => {
      setCalculatedTypingDuration(Date.now() - typingStartTime);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [typingStartTime]);

  // Load draft when component mounts
  useEffect(() => {
    if (hasDraft && onLoadDraft && messageText === '') {
      const draft = onLoadDraft();
      if (draft) {
        setMessageText(draft);
      }
    }
  }, [hasDraft, onLoadDraft, messageText, setMessageText]);

  // Save draft when message text changes
  useEffect(() => {
    if (onSaveDraft && messageText) {
      onSaveDraft(messageText);
    }
  }, [messageText, onSaveDraft]);

  // Handle user typing with draft support
  const handleTyping = () => {
    handleUserTyping();
    if (onSaveDraft && messageText) {
      onSaveDraft(messageText);
    }
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden relative">
      {/* Connection status indicator */}
      {connectionStatus !== ConnectionStatus.CONNECTED && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
          <ConnectionStatusIndicator 
            status={connectionStatus} 
            variant="compact"
            showLabel
            className="shadow-md" 
          />
        </div>
      )}

      {inlineFormComponent}
      
      {(!showInlineForm || conversationId) && (
        <div className="flex-grow flex flex-col">
          <MessageList 
            messages={messages}
            isTyping={isTyping || remoteIsTyping}
            setMessageText={setMessageText}
            readReceipts={readReceipts}
            onMessageReaction={onMessageReaction}
            searchResults={messageIds}
            highlightMessage={highlightMessage}
            searchTerm={searchTerm}
            agentAvatar={agentAvatar}
            userAvatar={userAvatar}
            onScrollTop={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            conversationId={conversationId}
            agentStatus={agentStatus}
            onToggleHighlight={onToggleHighlight}
            typingDuration={typingDuration || calculatedTypingDuration}
          />
        </div>
      )}
      
      <div className="flex-shrink-0">
        {pendingCount > 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 text-center">
            {pendingCount} message{pendingCount !== 1 ? 's' : ''} pending to be sent
          </div>
        )}
        
        {hasDraft && (
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 text-center">
            Draft message loaded
          </div>
        )}
        
        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          handleEndChat={handleEndChat}
          hasUserSentMessage={isTyping}
          onTyping={handleTyping}
          disabled={showInlineForm}
          isOffline={connectionStatus !== ConnectionStatus.CONNECTED}
        />
        
        <PoweredByBar />
      </div>
    </div>
  );
};

export default ChatBody;
