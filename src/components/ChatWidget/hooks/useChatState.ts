
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { saveConversationToStorage, loadConversationsFromStorage, getWorkspaceIdAndApiKey, getAccessToken, setUserFormDataInLocalStorage, getUserFormDataFromLocalStorage } from '../utils/storage';
import { logout, checkSessionValidity } from '../utils/security';
import { fetchConversationByTicketId } from '../services/api';

type ViewState = 'home' | 'messages' | 'chat';

interface ApiTicket {
  id: string;
  title: string;
  description: string | null;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  unread: number;
  deviceId: string;
  assigneeId: string | null;
}

interface ApiMessage {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  ticketId: string;
  userType: 'customer' | 'agent';
}

export function useChatState() {
  const [viewState, setViewState] = useState<ViewState>('messages'); // Default to messages view
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(getUserFormDataFromLocalStorage());
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

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
      // Flag to indicate whether contact has been identified yet
      contactIdentified: !!formData
    };

    setActiveConversation(newConversation);
    setViewState('chat');
  }, []);

  const handleSetFormData = useCallback(async (formData: Record<string, string>) => {
    // Check if the form data is already set
    if (userFormData === undefined) {
      // Create new contact in database
      const { apiKey } = getWorkspaceIdAndApiKey();
      const accessToken = getAccessToken();
      try {
        const response = await fetch("https://dev-socket.pullseai.com/api/widgets/createContactDevice/85c7756b-f333-4ec9-a440-c4d1850482c3", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken ? `Bearer ${accessToken}` : ''
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
            if (activeConversation) {
              setActiveConversation({
                ...activeConversation,
                contactIdentified: true
              });
            }
          }
        } else {
          toast.error(data.message || "Failed to create contact");
        }
      } catch (error) {
        console.error("Error creating contact:", error);
        toast.error("Failed to connect to the server");
      }
    }
  }, [userFormData, activeConversation]);

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

  // Convert API ticket messages to our Message format
  const convertApiMessagesToMessages = useCallback((apiMessages: ApiMessage[]): Message[] => {
    return apiMessages.map(msg => ({
      id: msg.id,
      text: msg.message,
      sender: msg.userType === 'customer' ? 'user' : 'agent',
      timestamp: new Date(msg.createdAt),
      createdAt: new Date(msg.createdAt),
      type: 'text',
      status: 'sent'
    }));
  }, []);

  // Handler for when a ticket is selected from the messages view
  const handleSelectTicket = useCallback(async (ticket: ApiTicket) => {
    setIsLoadingConversation(true);

    try {
      // Fetch conversation history for this ticket
      const response = await fetchConversationByTicketId(ticket.id);
      
      if (response.status === 'success' && response.data) {
        // Convert API messages to our format
        const messages = convertApiMessagesToMessages(response.data);

        // Create conversation object from ticket
        const conversation: Conversation = {
          id: ticket.id,
          title: ticket.title || 'Support Conversation',
          lastMessage: ticket.lastMessage || '',
          createdAt: new Date(ticket.createdAt),
          messages: messages,
          agentInfo: {
            name: 'Support Agent',
            status: 'online',
            avatar: undefined
          },
          contactIdentified: true,
          ticketId: ticket.id,
          metadata: {
            ticketProgress: Math.floor(Math.random() * 100),
            status: ticket.status
          }
        };

        setActiveConversation(conversation);
        setViewState('chat');
      } else {
        toast.error('Failed to load conversation history');
      }
    } catch (error) {
      console.error('Error fetching ticket conversation:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoadingConversation(false);
    }
  }, [convertApiMessagesToMessages]);

  // Handler for when a conversation is selected from the messages view
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
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
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleSelectTicket,
    handleUpdateConversation,
    handleLogout,
    userFormData,
    setUserFormData: handleSetFormData,
    isLoadingConversation
  };
}
