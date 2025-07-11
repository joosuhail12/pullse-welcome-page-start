
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatForm from '../components/PreChatForm';
import ConversationRating from '../components/ConversationRating';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { getChatSessionId } from '../utils/storage';
import { useChatContext } from '../context/chatContext';
import { useAblyContext } from '../context/ablyContext';
import EnhancedLoadingIndicator from '../components/EnhancedLoadingIndicator';
import { toast } from 'sonner';
import { fetchConversationByTicketId } from '../services/api';
import { UserActionData } from '../types';

interface ChatViewProps {
}

const ChatView = React.memo(({
}: ChatViewProps) => {
  const { config, activeConversation, setViewState, setActiveConversation, handleSetFormData, isUserLoggedIn, isDemo } = useChatContext();
  const { isConnected, subscribeToChannel, unsubscribeFromChannel, publishToChannel } = useAblyContext();
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Check if conversation rating should be shown
  const showRating = useMemo(() => {
    return (
      config?.interfaceSettings?.enableConversationRating === true &&
      (activeConversation.status === 'ended' || activeConversation.status === 'closed') &&
      !activeConversation.rating
    );
  }, [config?.interfaceSettings?.enableConversationRating, activeConversation?.status, activeConversation?.rating]);

  const handleFormSubmission = async (data: Record<string, string>) => {
    setIsFormSubmitting(true);
    await handleSetFormData(data);
  }

  const handleSendMessage = async () => {
    setActiveConversation((prev: any) => {
      return {
        ...prev,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          text: messageText,
          sender: 'customer',
          timestamp: new Date(),
          createdAt: new Date()
        }]
      }
    });
    setMessageText('');
    const sessionId = getChatSessionId();
    if (activeConversation.ticketId) {
      console.log('Publishing message to message channel', `widget:conversation:ticket-${activeConversation.ticketId}`);
      await publishToChannel(`widget:conversation:ticket-${activeConversation.ticketId}`, 'message', {
        text: messageText,
        sender: 'customer',
        timestamp: new Date().toISOString(),
        ticketId: activeConversation.ticketId
      });
    } else {
      console.log('Publishing message to new_ticket channel');
      await publishToChannel(`widget:contactevent:${sessionId}`, 'new_ticket', {
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
    }
  }

  useEffect(() => {
    if (isConnected && isFormSubmitting) {
      setIsFormSubmitting(false);
    }
  }, [isConnected, isFormSubmitting]);

  const handleExistingTicketReply = (message: any) => {
    console.log("Message recieved on ticket");
    console.log(message);

    const { data } = message;
    const ticketId = data?.ticketId;

    if (!ticketId) {
      toast.error('Ticket ID not found');
      return;
    }

    setActiveConversation((prev: any) => {
      return {
        ...prev,
        messages: [...prev.messages, {
          id: data?.id || crypto.randomUUID(),
          text: data?.message,
          sender: data && data?.senderType ? data.senderType : data?.from,
          timestamp: new Date(),
          createdAt: new Date(),
          messageType: data?.messageType,
          messageConfig: data?.messageConfig
        }]
      };
    });
  }

  const handleNewTicketReply = (message: any) => {
    console.log('New ticket reply received');
    console.log(message);
    const sessionId = getChatSessionId();
    unsubscribeFromChannel(`widget:contactevent:${sessionId}`, 'new_ticket_reply');
    const { data } = message;
    const ticketId = data?.ticketId;

    if (!ticketId) {
      toast.error('Ticket ID not found');
      return;
    }
    setActiveConversation((prev: any) => {
      return {
        ...prev,
        ticketId: ticketId
      };
    });

    subscribeToChannel(`widget:conversation:ticket-${ticketId}`, 'message_reply', (message) => {
      handleExistingTicketReply(message);
    });

    fetchConversationByTicketId(ticketId);
  };

  useEffect(() => {
    if (isConnected) {
      const sessionId = getChatSessionId();
      if (activeConversation.ticketId) {
        console.log('Subscribing to message channel');
        subscribeToChannel(`widget:conversation:ticket-${activeConversation.ticketId}`, 'message_reply', (message) => {
          handleExistingTicketReply(message);
        });
      } else {
        console.log('Subscribing to new_ticket_reply channel');
        subscribeToChannel(`widget:contactevent:${sessionId}`, 'new_ticket_reply', (message) => {
          handleNewTicketReply(message);
        });
      }
    }

    return () => {
      const sessionId = getChatSessionId();
      if (activeConversation.ticketId) {
        console.log('Unsubscribing from message channel');
        unsubscribeFromChannel(`widget:conversation:ticket-${activeConversation.ticketId}`, 'message_reply');
      } else {
        console.log('Unsubscribing from new_ticket_reply channel');
        unsubscribeFromChannel(`widget:contactevent:${sessionId}`, 'new_ticket_reply');
      }
    }
  }, [isConnected]);

  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText: originalHighlightText,
    messageIds,
    isSearching
  } = useMessageSearch(activeConversation?.messages || []);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  }, [showSearch, clearSearch]);

  const handleLoadMoreMessages = useCallback(async () => {
    // if (!loadPreviousMessages) return;

    // setIsLoadingMore(true);
    // try {
    //   await loadPreviousMessages();
    // } finally {
    //   setIsLoadingMore(false);
    // }
  }, []);

  const highlightText = useCallback((text: string): string[] => {
    if (!searchTerm) return [text];

    return originalHighlightText(text, searchTerm)
      .map(part => part.text);
  }, [searchTerm, originalHighlightText]);

  const agentAvatar = useMemo(() => activeConversation?.agentInfo?.avatar || config?.brandAssets?.avatarUrl,
    [activeConversation?.agentInfo?.avatar, config?.brandAssets?.avatarUrl]);

  const userAvatar = undefined;
  const hasMoreMessages = activeConversation?.messages?.length >= 20;

  const handleUserAction = (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => {
    if (activeConversation?.ticketId) {
      console.log("Handling user action");
      console.log(action, data);
      publishToChannel(`widget:conversation:ticket-${activeConversation.ticketId}`, 'user_action', {
        action,
        data,
        conversationId
      });
    }
  };

  const inlineFormComponent = useMemo(() => {
    if (!isUserLoggedIn) {
      return <PreChatForm config={config} onFormComplete={handleFormSubmission} />;
    }
    return null;
  }, [isUserLoggedIn, config, handleFormSubmission]);

  if (isFormSubmitting) {
    return <EnhancedLoadingIndicator config={config} />;
  }

  return (
    <div
      style={{
        backgroundColor: config.colors?.backgroundColor || 'transparent'
      }}
      className={`flex flex-col h-full
              ${!config.colors?.backgroundColor && 'bg-gradient-to-br from-soft-purple-50 to-soft-purple-100'}`}
    >
      <ChatViewHeader
        conversation={activeConversation}
        onBack={() => setViewState('home')}
        config={config}
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        searchMessages={searchMessages}
        clearSearch={clearSearch}
        searchResultCount={messageIds.length}
        isSearching={isSearching}
        showSearchFeature={!!config?.features?.searchMessages}
      />

      <div style={{
        overflowY: 'scroll',
        overflowX: 'hidden'
      }} className="flex-grow flex flex-col">
        {!isUserLoggedIn && !isDemo ? (
          <div className="flex-grow flex flex-col justify-center items-center p-4 bg-gradient-to-br from-[#f8f7ff] to-[#f5f3ff]">
            <div className="w-full max-w-md">
              {inlineFormComponent}
            </div>
          </div>
        ) : (
          <>
            <MessageList
              messages={activeConversation?.messages || []}
              isTyping={false}
              setMessageText={() => { }}
              onMessageReaction={() => { }}
              searchResults={messageIds}
              highlightMessage={highlightText}
              searchTerm={searchTerm}
              agentAvatar={agentAvatar}
              userAvatar={userAvatar}
              handleSendMessage={() => { }}
              onScrollTop={handleLoadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMore={isLoadingMore}
              conversationId={activeConversation?.id}
              agentStatus={activeConversation?.agentInfo?.status}
              config={config}
              isDemo={isDemo}
              handleUserAction={handleUserAction}
            />

            {/* Rating component - shown only when conditions are met */}
            {showRating && (
              <div className="mx-4 my-2">
                <ConversationRating onSubmitRating={() => { }} config={config} />
              </div>
            )}
          </>
        )}
      </div>

      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={() => { }}
        handleEndChat={() => { }}
        hasUserSentMessage={false}
        onTyping={() => { }}
        disabled={isDemo ? true : false}
      />
    </div>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;