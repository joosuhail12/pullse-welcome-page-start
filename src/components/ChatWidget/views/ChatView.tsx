import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatForm from '../components/PreChatForm';
import ConversationRating from '../components/ConversationRating';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useChatContext } from '../context/chatContext';
import { useCentrifugo } from '../context/centrifugoContext';
import EnhancedLoadingIndicator from '../components/EnhancedLoadingIndicator';
import { toast } from 'sonner';
import { fetchConversationByTicketId, sendWidgetMessage, sendUserAction, createNewTicket, sendReadReceipt } from '../services/api';
import { Conversation, UserActionData } from '../types';
import * as Sentry from '@sentry/react';
import { useChatWidgetStore } from '@/store/store';

interface ChatViewProps {
}

const ChatView = React.memo(({
}: ChatViewProps) => {
  const { activeConversation, addMessageToConversation, updateMessageStatus, setActiveConversation, setBotStreamingStatus, appendBotStreamingToken, clearBotStreaming } = useChatWidgetStore();
  const { config, setViewState, handleSetFormData, isUserLoggedIn, isDemo } = useChatContext();
  const { isConnected, subscribe, unsubscribe } = useCentrifugo();
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [messageText, setMessageText] = useState('');

  // -- Read receipts: debounced, visibility-aware --
  const lastReadReceiptRef = useRef<number>(0);
  const READ_RECEIPT_DEBOUNCE_MS = 5000;

  const trySendReadReceipt = useCallback((ticketId: string | undefined) => {
    if (!ticketId || isDemo || document.hidden) return;
    const now = Date.now();
    if (now - lastReadReceiptRef.current < READ_RECEIPT_DEBOUNCE_MS) return;
    lastReadReceiptRef.current = now;
    sendReadReceipt(ticketId).catch(() => { /* fire-and-forget */ });
  }, [isDemo]);

  // Send on mount (conversation opened)
  useEffect(() => {
    if (isUserLoggedIn && activeConversation?.ticketId) {
      trySendReadReceipt(activeConversation.ticketId);
    }
  }, [activeConversation?.ticketId, isUserLoggedIn]);

  // Send when browser tab regains visibility
  useEffect(() => {
    const handler = () => {
      if (!document.hidden && activeConversation?.ticketId) {
        trySendReadReceipt(activeConversation.ticketId);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [activeConversation?.ticketId, trySendReadReceipt]);

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

  const handleSendMessage = async (messageText: string, attachmentType: 'image' | 'pdf', attachmentUrl: string) => {
    if (activeConversation?.messages[activeConversation?.messages?.length - 1]?.messageType === 'data_collection' && activeConversation?.messages[activeConversation?.messages?.length - 1]?.messageConfig?.required === true) {
      toast.error('Please submit the data collection form first');
      return;
    }
    if (messageText.length === 0 && attachmentUrl === '') {
      toast.error('Please enter a message or upload a file');
      return;
    }
    if (activeConversation?.messages?.length > 1 && !activeConversation?.ticketId) {
      toast.error('Please wait');
      return;
    }

    const clientGeneratedId = crypto.randomUUID();

    // Optimistic UI — show immediately with 'sending' status
    addMessageToConversation({
      id: clientGeneratedId,
      text: messageText,
      messageType: 'text',
      type: 'text',
      attachmentType: attachmentType,
      attachmentUrl: attachmentUrl,
      sender: 'customer',
      status: 'sending',
      widgetGeneratedId: clientGeneratedId,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    setMessageText('');

    if (activeConversation.ticketId) {
      // Existing ticket — POST to backend
      console.log('Sending message via HTTP POST', `ticketId: ${activeConversation.ticketId}`);
      try {
        await sendWidgetMessage({
          ticketId: activeConversation.ticketId,
          message: messageText,
          type: 'chat',
          clientGeneratedId,
          attachmentType: attachmentType || undefined,
          attachmentUrl: attachmentUrl || undefined,
        });
        updateMessageStatus(clientGeneratedId, 'sent');
      } catch (err) {
        console.error('Failed to send message:', err);
        updateMessageStatus(clientGeneratedId, 'failed' as any);
      }
    } else {
      // New ticket — POST to create new ticket
      console.log('Creating new ticket via HTTP POST');
      try {
        const response = await createNewTicket({
          message: messageText,
          message_type: 'chat',
          attachmentType: attachmentType || undefined,
          attachmentUrl: attachmentUrl || undefined,
        });

        const ticketId = response.data?.ticketId || response.ticketId;

        if (ticketId) {
          // Update store with ticket info
          setActiveConversation((prev: Conversation) => ({
            ...(prev || {}),
            ticketId,
          }));
          updateMessageStatus(clientGeneratedId, 'sent');
        }
      } catch (err) {
        console.error('Failed to create new ticket:', err);
        updateMessageStatus(clientGeneratedId, 'failed' as any);
      }
    }
  }

  useEffect(() => {
    if (isConnected && isFormSubmitting) {
      setIsFormSubmitting(false);
    }
  }, [isConnected, isFormSubmitting]);

  const handleIncomingMessage = (data: any) => {
    console.log('[Centrifugo] handleIncomingMessage:', data);
    const ticketId = data?.ticketId;

    if (!ticketId) {
      console.warn('[Centrifugo] Message missing ticketId, ignoring:', data);
      toast.error('Ticket ID not found');
      return;
    }

    const senderType = data.sender.type;
    const senderName = data.sender.name;

    // Skip our own messages (already shown via optimistic UI)
    if (data.isCustomer || senderType === 'customer') {
      console.log('[Centrifugo] Skipping own message (optimistic):', data.id, data.clientGeneratedId);
      return;
    }

    if (!data?.content && !data?.attachmentUrl) {
      console.warn('[Centrifugo] Message has no content or attachment:', data);
      Sentry.captureException(new Error(`Message is empty: ${JSON.stringify(data)}`));
      return;
    }

    const msgTimestamp = data?.timestamp ? new Date(data.timestamp) : new Date();
    console.log('[Centrifugo] Adding incoming message:', { id: data?.id, sender: senderType, content: data?.content?.substring(0, 50) });

    addMessageToConversation({
      id: data?.id || crypto.randomUUID(),
      text: data?.content,
      sender: senderType || 'agent',
      timestamp: msgTimestamp,
      createdAt: msgTimestamp,
      messageType: data?.messageType || data?.type,
      messageConfig: data?.messageConfig,
      senderName: senderName,
      status: data?.status || 'sent',
      attachmentType: data?.attachmentType,
      attachmentUrl: data?.attachmentUrl,
    });

    // Agent message arrived while customer is viewing — mark as read
    trySendReadReceipt(ticketId);
  };

  const handleBotStream = (data: any) => {
    const ticketId = data?.ticketId;
    if (!ticketId) {
      console.warn('[Centrifugo] bot_stream missing ticketId, ignoring:', data);
      return;
    }

    const streamData = data?.data || data;
    console.log('[bot_stream]', data?.event, streamData?.token || '', data?.serviceName || '');

    switch (data?.event) {
      case 'typing':
        setBotStreamingStatus(ticketId, 'typing');
        break;
      case 'route': {
        const labels: Record<string, string> = {
          knowledge_query: 'Looking into this...',
          action: 'On it...',
          escalate: 'Connecting you with the team...',
        };
        const label = labels[data?.data?.decision];
        if (label) setBotStreamingStatus(ticketId, label);
        break;
      }
      case 'plan':
        setBotStreamingStatus(ticketId, 'Working on it...');
        break;
      case 'tool_result':
        setBotStreamingStatus(ticketId, 'Almost there...');
        break;
      case 'token':
        if (data?.data?.token != null) {
          appendBotStreamingToken(ticketId, data.data.token);
        }
        break;
      case 'complete':
        clearBotStreaming();
        break;
    }
  };

  // Subscribe to ticket channel for incoming messages + bot streams
  useEffect(() => {
    if (!isConnected || !activeConversation?.ticketId) return;

    const ticketId = activeConversation.ticketId;
    const channel = `ticket:${ticketId}`;

    console.log('[Centrifugo] Subscribing to ticket channel:', channel);
    subscribe(channel, (ctx) => {
      const data = ctx.data;
      console.log(`[Centrifugo] Event received on ${channel}:`, data.event, data);

      switch (data.event) {
        case 'message':
          clearBotStreaming();
          handleIncomingMessage(data);
          break;
        case 'bot_stream':
          handleBotStream(data);
          break;
        case 'delivery_status': {
          console.log('[Centrifugo] delivery_status on ticket channel:', data);
          if (data.status === 'read' && data.readAt) {
            // Ticket-level read — update agentReadAt, ticks are derived from this
            setActiveConversation((prev: Conversation) => ({
              ...prev,
              agentReadAt: data.readAt,
            }));
          }
          break;
        }
        default:
          console.log(`[Centrifugo] Unhandled event on ${channel}:`, data.event, data);
      }
    });

    return () => {
      console.log('[Centrifugo] Unsubscribing from ticket channel:', channel);
      unsubscribe(channel);
    };
  }, [isConnected, activeConversation?.ticketId]);

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
  }, []);

  const highlightText = useCallback((text: string): string[] => {
    if (!searchTerm) return [text];

    return originalHighlightText(text, searchTerm)
      .map(part => part.text);
  }, [searchTerm, originalHighlightText]);

  const botStreaming = useChatWidgetStore(state => state.botStreaming);

  const agentAvatar = useMemo(() => activeConversation?.agentInfo?.avatar || config?.brandAssets?.avatarUrl,
    [activeConversation?.agentInfo?.avatar, config?.brandAssets?.avatarUrl]);

  const userAvatar = undefined;
  const hasMoreMessages = activeConversation?.messages?.length >= 20;

  const handleUserAction = async (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => {
    if (activeConversation?.ticketId) {
      console.log("Handling user action");
      console.log(action, data);
      try {
        await sendUserAction({
          ticketId: activeConversation.ticketId,
          action,
          data,
          conversationId,
        });
      } catch (err) {
        console.error('Failed to send user action:', err);
      }
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
              botStreamingText={botStreaming.ticketId === activeConversation?.ticketId ? botStreaming.text : ''}
              botStreamingStatus={botStreaming.ticketId === activeConversation?.ticketId ? botStreaming.status : null}
              agentReadAt={activeConversation?.agentReadAt}
            />

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
