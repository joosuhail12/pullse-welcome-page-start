
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types';
import { saveConversationToStorage, loadConversationsFromStorage, getWorkspaceIdAndApiKey, getAccessToken, setUserFormDataInLocalStorage, getContactDetailsFromLocalStorage, isUserLoggedIn } from '../utils/storage';
import { logout, checkSessionValidity } from '../utils/security';

type ViewState = 'home' | 'messages' | 'chat';

export function useChatState() {
  const [viewState, setViewState] = useState<ViewState>('messages'); // Default to messages view
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(undefined);

  // Load any existing conversations and check user login state
  useEffect(() => {
    // Check if the session is valid
    if (checkSessionValidity()) {
      // Check if the user is logged in based on contact details
      if (isUserLoggedIn()) {
        const contactDetails = getContactDetailsFromLocalStorage();
        if (contactDetails) {
          // If user is logged in, set form data from contact details
          const formattedFormData: Record<string, string> = {
            email: contactDetails.email || '',
            name: `${contactDetails.firstname || ''} ${contactDetails.lastname || ''}`.trim()
          };
          setUserFormData(formattedFormData);
        }
      }
      
      // Stay in messages view if already logged in
      setViewState('messages');
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
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: formData?.name ? `Chat with ${formData.name}` : 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      agentInfo: {
        name: 'Support Agent',
        avatar: undefined // You could set a default avatar URL here
      },
      // Flag to indicate whether contact has been identified yet
      contactIdentified: !!formData || isUserLoggedIn()
    };

    setActiveConversation(newConversation);
    setViewState('chat');
  }, []);

  const handleSetFormData = useCallback(async (formData: Record<string, string>) => {
    // Check if the form data is already set or if user is already logged in
    if (userFormData === undefined && !isUserLoggedIn()) {
      // Create new contact in database
      const { apiKey } = getWorkspaceIdAndApiKey();
      const accessToken = getAccessToken();
      try {
        const data = await fetch("https://dev-socket.pullseai.com/api/widgets/createContactDevice/" + apiKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          },
          body: JSON.stringify(formData)
        });
        const json = await data.json();
        if (json.success === "success") {
          setUserFormData(formData);
          setUserFormDataInLocalStorage(formData);
        } else {
          toast.error(json.message || "Failed to create contact");
        }
      } catch (error) {
        console.error("Error creating contact:", error);
        toast.error("Failed to create contact. Please try again.");
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
    handleUpdateConversation,
    handleLogout,
    userFormData,
    setUserFormData: handleSetFormData,
  };
}
