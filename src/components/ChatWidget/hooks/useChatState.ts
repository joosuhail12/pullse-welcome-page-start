
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types';
import { saveConversationToStorage, loadConversationsFromStorage, getWorkspaceIdAndApiKey, getAccessToken, setUserFormDataInLocalStorage, getUserFormDataFromLocalStorage } from '../utils/storage';
import { logout, checkSessionValidity } from '../utils/security';

type ViewState = 'home' | 'messages' | 'chat';

export function useChatState() {
  const [viewState, setViewState] = useState<ViewState>('messages'); // Default to messages view
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(getUserFormDataFromLocalStorage());

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
      timestamp: new Date(),
      createdAt: new Date(),
      updated_at: new Date(),
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
      const data = await fetch("https://dev-socket.pullseai.com/api/widgets/createContactDevice/" + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify(formData)
      });
      const json = await data.json();
      if (json.success == "success") {
        setUserFormData(formData);
        setUserFormDataInLocalStorage(formData);
      } else {
        toast.error(json.message);
      }
    }
  }, [userFormData]);

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

  // Update conversation with new message
  const handleUpdateConversation = useCallback((updatedConversation: Conversation) => {
    setActiveConversation(updatedConversation);
    // TODO: Save the updated conversation to localStorage
    // saveConversationToStorage(updatedConversation);
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
    handleUpdateConversation,
    handleLogout,
    userFormData,
    setUserFormData: handleSetFormData,
  };
}
