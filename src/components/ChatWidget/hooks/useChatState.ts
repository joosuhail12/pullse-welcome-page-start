import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Ticket, TicketMessage } from '../types';
import { saveConversationToStorage, getWorkspaceIdAndApiKey, setUserFormDataInLocalStorage, getUserFormDataFromLocalStorage, setAccessToken, setChatSessionId, getChatSessionId } from '../utils/storage';
import { logout, checkSessionValidity } from '../utils/security';
import { fetchConversationByTicketId, fetchConversations } from '../services/api';
import { createSystemMessage, createUserMessage } from '../utils/messageHandlers';

type ViewState = 'home' | 'messages' | 'chat';

export function useChatState() {
  const [viewState, setViewState] = useState<ViewState>('home'); // Default to messages view
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(getUserFormDataFromLocalStorage());
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  // Load any existing conversations when component mounts
  // and verify session validity
  useEffect(() => {
    if (checkSessionValidity()) {
      // Fetch conversations from server
      // loadConversationsFromStorage();
    } else {
      // If session is invalid, redirect to home view
      setViewState('home');
      // Reset active conversation
      setActiveConversation(null);
    }
  }, []);

  const handleStartChat = useCallback((formData?: Record<string, string>) => {
    // Create a new conversation even without form data
    // Form data will be collected in the ChatView component
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: formData?.name ? `Chat with ${formData.name}` : 'New Conversation',
      lastMessage: '',
      createdAt: new Date(),
      messages: [],
      agentInfo: {
        name: 'Support Agent',
        avatar: undefined // You could set a default avatar URL here
      },
    };

    setActiveConversation(newConversation);
    setViewState('chat');
  }, []);

  const handleSetFormData = useCallback(async (formData: Record<string, string>) => {
    // Create new contact in database
    const { apiKey } = getWorkspaceIdAndApiKey();
    if (!apiKey) {
      console.error("No API key found");
      return;
    };
    try {
      const response = await fetch("http://localhost:4000/api/widgets/createContactDevice/" + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.status === "success") {
        setUserFormData(formData);
        setUserFormDataInLocalStorage(formData);

        // If there's contact data in the response, update it
        if (data.data) {
          // Update any active conversation to mark it as identified
          setActiveConversation({
            ...activeConversation,
          });

          if (data.data?.accessToken) {
            setAccessToken(data.data.accessToken);
          }
          if (data.data?.sessionId) {
            setChatSessionId(data.data.sessionId);
          }
        }
        console.log('Contact created successfully');
        setViewState('home');
        return true;
      } else {
        toast.error(data.message || "Failed to create contact");
        return false;
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to connect to the server");
      return false;
    }
  }, [activeConversation]);

  const handleBackToMessages = useCallback(() => {
    // Update the conversation in localStorage before going back
    if (activeConversation && userFormData !== undefined) {
      saveConversationToStorage(activeConversation);
    }
    setViewState('messages');
  }, [activeConversation, userFormData]);

  const handleChangeView = useCallback((view: ViewState) => {
    if (view !== 'chat') {
      setViewState(view);
    }
  }, []);

  // Handler for when a conversation is selected from the messages view
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
  }, []);

  // Handler for when a ticket is selected
  const handleSelectTicket = useCallback(async (ticket: Ticket) => {
    setIsLoadingTicket(true);
    try {
      // Fetch conversation messages for this ticket
      const response = await fetchConversationByTicketId(ticket.id);

      if (response && response.status === "success" && response.data) {
        // Convert API response to Message objects
        const messages = response.data.map((msg: TicketMessage) => {
          return {
            id: msg.id,
            text: msg.message,
            sender: msg.userType === 'customer' ? 'user' : msg.userType === 'agent' ? 'agent' : 'system',
            senderType: msg.senderType,
            messageType: msg.messageType,
            messageConfig: msg.messageConfig,
            allowUserAction: msg.allowUserAction,
            createdAt: new Date(msg.createdAt),
            type: 'text',
            status: 'sent'
          };
        });

        // Create conversation object from ticket
        const conversation: Conversation = {
          id: `ticket-${ticket.id}`,
          ticketId: ticket.id,
          title: ticket.title || 'Support Ticket',
          lastMessage: ticket.lastMessage || '',
          createdAt: new Date(ticket.createdAt),
          messages: messages,
          status: ticket.status as 'active' | 'ended' | 'open',
          agentInfo: {
            name: 'Support Agent',
            status: 'online'
          },
          unread: ticket.unread ? true : false,
          rating: ticket.rating
        };

        setActiveConversation(conversation);
        setViewState('chat');
      } else {
        // If no messages, create a conversation with a welcome message
        const conversation: Conversation = {
          id: `ticket-${ticket.id}`,
          ticketId: ticket.id,
          title: ticket.title || 'Support Ticket',
          lastMessage: ticket.lastMessage || '',
          createdAt: new Date(ticket.createdAt),
          messages: [
            createSystemMessage('Welcome to your support ticket. How can we help you today?')
          ],
          status: ticket.status as 'active' | 'ended' | 'open',
          agentInfo: {
            name: 'Support Agent',
            status: 'online'
          },
          unread: ticket.unread ? true : false,
          rating: ticket.rating
        };

        setActiveConversation(conversation);
        setViewState('chat');
      }
    } catch (error) {
      console.error('Error fetching ticket conversation:', error);
      toast.error('Failed to load ticket conversation');
      setViewState('messages');
    } finally {
      setIsLoadingTicket(false);
    }
  }, []);

  // Update conversation with new message
  const handleUpdateConversation = useCallback((updatedConversation: Conversation) => {
    setActiveConversation(updatedConversation);
    // Save the updated conversation to localStorage
    saveConversationToStorage(updatedConversation);
  }, []);

  // Handle logout and session invalidation
  const handleLogout = useCallback(() => {
    // Clear active conversation
    setActiveConversation(null);

    // Return to home view
    setViewState('home');

    // Clear form data
    setUserFormData(undefined);

    // Invalidate the session
    logout();
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
    handleLogout,
    userFormData,
    setUserFormData: handleSetFormData,
  };
}
