
import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation, Ticket } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/storage';
import { fetchConversations, fetchConversationByTicketId } from '../services/api';
import { subscribeToChatEvent } from '../utils/events';
import { ChatEventPayload } from '../config';

export function useChatState() {
  const [viewState, setViewState] = useState<'home' | 'messages' | 'chat'>('home');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(undefined);

  // Subscribe to the ticket created event to handle the new ticket flow
  useEffect(() => {
    // Subscribe to the ticket created event to handle the new ticket flow
    const unsubscribe = subscribeToChatEvent('chat:ticketCreated', async (event: ChatEventPayload) => {
      if (event.data?.ticketId) {
        console.log('Handling new ticket creation with ID:', event.data.ticketId);

        setIsLoadingTicket(true);

        try {
          // Fetch the conversation details using the ticket ID
          const conversationData = await fetchConversationByTicketId(event.data.ticketId);

          if (conversationData) {
            // Transform the response to a conversation object
            const updatedConversation: Conversation = {
              id: event.data.ticketId,
              title: conversationData.title || 'New Conversation',
              status: 'open',
              unread: false,
              lastMessage: conversationData.lastMessage || '',
              messages: conversationData.messages || [],
              assignedAgent: conversationData.assignedAgent || null,
              sessionId: event.data.sessionId
            };

            // Update the active conversation
            setActiveConversation(updatedConversation);

            // Ensure we're in chat view
            setViewState('chat');
          }
        } catch (error) {
          console.error('Error fetching conversation details:', error);
        } finally {
          setIsLoadingTicket(false);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartChat = useCallback((formData?: Record<string, string>) => {
    setUserFormData(formData);
    setViewState('chat');
    setActiveConversation({
      id: `contactevent-${getChatSessionId()}`,
      title: 'New Conversation',
      status: 'open',
      unread: false,
      lastMessage: '',
      messages: [],
      assignedAgent: null,
      sessionId: getChatSessionId()
    });
  }, []);

  const handleBackToMessages = useCallback(() => {
    setViewState('messages');
  }, []);

  const handleChangeView = useCallback((view: 'home' | 'messages' | 'chat') => {
    setViewState(view);
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
  }, []);

  const handleSelectTicket = useCallback((ticket: Ticket) => {
    setActiveConversation({
      id: ticket.id,
      title: ticket.description || 'Conversation',
      status: ticket.status as 'open' | 'active' | 'ended',
      unread: false,
      lastMessage: ticket.description || '',
      messages: [],
      assignedAgent: null,
      sessionId: getChatSessionId()
    });
    setViewState('chat');
  }, []);

  const handleUpdateConversation = useCallback((updatedConversation: Conversation) => {
    setActiveConversation(updatedConversation);
  }, []);

  return {
    viewState,
    activeConversation,
    isLoadingTicket,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleSelectTicket,
    handleUpdateConversation,
    userFormData,
    setUserFormData
  };
}
