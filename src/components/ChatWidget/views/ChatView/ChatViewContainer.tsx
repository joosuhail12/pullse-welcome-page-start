import React, { useState, useEffect, useMemo } from 'react';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import { useAgentTyping } from '../../hooks/useAgentTyping';
import { Conversation, Message, MessageReadStatus } from '../../types';
import { dispatchChatEvent } from '../../utils/events';
import ChatHeader from './ChatHeader';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';

interface ChatViewContainerProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (conversation: Conversation) => void;
  onEndChat: () => void;
  workspaceId: string;
  config?: any;
  playMessageSound?: () => void;
  userFormData?: Record<string, any>;
  setUserFormData?: (data: Record<string, any>) => void;
  onSendMessage?: (message: string) => void;
  startFormFlow?: () => void;
  children?: React.ReactNode;
}

const MAX_MESSAGES = 100;

export const ChatViewContainer: React.FC<ChatViewContainerProps> = ({
  conversation,
  onBack,
  onUpdateConversation,
  onEndChat,
  workspaceId,
  config,
  playMessageSound,
  userFormData,
  setUserFormData,
  onSendMessage,
  startFormFlow,
  children
}) => {
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Get message handling actions
  const { 
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    fileError
  } = useMessageActions(
    conversation.messages || [], 
    (messages) => onUpdateConversation({...conversation, messages}),
    `conversation:${conversation.id}`, 
    workspaceId
  );
  
  // Setup notifications for incoming messages
  useChatNotifications(conversation);
  
  // Setup agent typing simulation
  const { agentIsTyping } = useAgentTyping(conversation.id);
  
  // Keep track of read receipts
  const [readReceipts, setReadReceipts] = useState<Record<string, { status: MessageReadStatus, timestamp?: Date }>>({});
  
  // Toggle search mode
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
      setSearchResults([]);
    }
  };
  
  // Handle message search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term) {
      setSearchResults([]);
      return;
    }
    
    // Search through messages
    const results = conversation.messages
      .filter(msg => 
        msg.text.toLowerCase().includes(term.toLowerCase())
      )
      .map(msg => msg.id);
      
    setSearchResults(results);
  };
  
  // Send a message
  const sendMessageHandler = () => {
    if (!messageText.trim()) return;
    
    const messageContent = messageText;
    setMessageText('');
    setIsTyping(false);
    
    // Send through hook
    handleSendMessage();
    
    // Call external handler if provided
    if (onSendMessage) {
      onSendMessage(messageContent);
    }
  };
  
  // Handle typing indicators
  const handleUserTypingCallback = () => {
    if (!isTyping) {
      setIsTyping(true);
      handleUserTyping();
      
      // Simulate typing stop after 5 seconds of no input
      setTimeout(() => {
        setIsTyping(false);
        dispatchChatEvent('chat:typingStopped', {
          conversationId: conversation.id,
          userId: 'user'
        });
      }, 5000);
    }
  };
  
  // Highlight search matches in message text
  const highlightSearchMatch = (text: string) => {
    if (!searchTerm) {
      return [{ text, highlighted: false }];
    }
    
    const parts = [];
    let lastIndex = 0;
    const termLowerCase = searchTerm.toLowerCase();
    const textLowerCase = text.toLowerCase();
    
    let index = textLowerCase.indexOf(termLowerCase);
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, index),
          highlighted: false
        });
      }
      
      parts.push({
        text: text.slice(index, index + searchTerm.length),
        highlighted: true
      });
      
      lastIndex = index + searchTerm.length;
      index = textLowerCase.indexOf(termLowerCase, lastIndex);
    }
    
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        highlighted: false
      });
    }
    
    return parts;
  };
  
  // Generate mock read receipts for demonstration
  const generateReadReceipts = useMemo(() => {
    const receipts: Record<string, { status: MessageReadStatus, timestamp?: Date }> = {};
    
    conversation.messages.forEach(message => {
      if (message.sender === 'user') {
        receipts[message.id] = {
          status: message.status || 'delivered',
          timestamp: new Date(message.timestamp.getTime() + 2000)
        };
      }
    });
    
    return receipts;
  }, [conversation.messages]);
  
  // Update read receipts
  useEffect(() => {
    setReadReceipts(generateReadReceipts);
  }, [generateReadReceipts]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader
        title={conversation.title}
        onBack={onBack}
        onSearch={toggleSearch}
        onEndChat={onEndChat}
        showSearch={showSearch}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
      />
      
      <div className="flex-1 overflow-hidden">
        {children || (
          <>
            {/* Message List */}
            <MessageList
              messages={conversation.messages}
              isTyping={agentIsTyping}
              searchResults={searchResults}
              highlightMessage={highlightSearchMatch}
              readReceipts={readReceipts}
              onMessageReaction={() => {}}
              setMessageText={setMessageText}
            />
            
            {/* Message Input */}
            <MessageInput
              messageText={messageText}
              setMessageText={setMessageText}
              onSendMessage={sendMessageHandler}
              onUserTyping={handleUserTypingCallback}
              onFileUpload={handleFileUpload}
              fileError={fileError}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatViewContainer;
