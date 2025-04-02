
import React, { useState, useCallback } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import SearchBar from '../components/SearchBar';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateFormData, sanitizeInput } from '../utils/validation';
import { dispatchChatEvent } from '../utils/events';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

const ChatView = ({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}: ChatViewProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [inlineFormData, setInlineFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValid, setFormValid] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(
    !userFormData && config?.preChatForm?.enabled && !conversation.contactIdentified
  );

  const {
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts,
    loadPreviousMessages
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  // Add message reactions
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    message => setMessages(message),
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  // Add message search
  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useMessageSearch(messages);

  // Function to share messages state with parent components
  const setMessages = (updatedMessages: React.SetStateAction<typeof messages>) => {
    if (typeof updatedMessages === 'function') {
      const newMessages = updatedMessages(messages);
      onUpdateConversation({
        ...conversation,
        messages: newMessages
      });
    } else {
      onUpdateConversation({
        ...conversation,
        messages: updatedMessages
      });
    }
  };

  // Toggle search bar
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  };

  // Handle loading previous messages for infinite scroll
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    setIsLoadingMore(true);
    try {
      await loadPreviousMessages();
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadPreviousMessages]);

  // Validate field input
  const validateField = (name: string, value: string, isRequired: boolean): string | null => {
    const sanitized = sanitizeInput(value);
    
    if (isRequired && !sanitized) {
      return "This field is required";
    }
    
    // Email validation
    if (name.toLowerCase().includes('email') && sanitized) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitized)) {
        return "Please enter a valid email address";
      }
    }
    
    // Phone validation (basic)
    if ((name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) && sanitized) {
      const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
      if (!phoneRegex.test(sanitized)) {
        return "Please enter a valid phone number";
      }
    }
    
    return null;
  };

  // Handle input change for inline form
  const handleInlineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = config.preChatForm.fields.find(f => f.name === name);
    
    // Validate this specific field
    const error = field ? validateField(name, value, field.required || false) : null;
    
    // Update error state
    setFormErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    
    // Sanitize input before storing
    const sanitized = sanitizeInput(value);
    const newFormData = { ...inlineFormData, [name]: sanitized };
    setInlineFormData(newFormData);
    
    // Check if all required fields are valid
    const requiredFields = config.preChatForm.fields.filter(field => field.required);
    const allRequiredFilled = requiredFields.every(field => {
      const fieldValue = newFormData[field.name];
      return fieldValue && fieldValue.trim() !== '' && !validateField(field.name, fieldValue, true);
    });
    
    setFormValid(allRequiredFilled);
  };

  // Submit inline form
  const submitInlineForm = () => {
    if (!formValid) return;
    
    const sanitizedData = validateFormData(inlineFormData);
    setShowInlineForm(false);
    
    // Update the parent form data if callback exists
    if (setUserFormData) {
      setUserFormData(sanitizedData);
    }
    
    // Dispatch form completion event
    dispatchChatEvent('contact:formCompleted', { formData: sanitizedData }, config);
    
    // Flag the conversation as having identified the contact
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
  };

  // Render inline form fields
  const renderInlineFormFields = () => {
    const fields = config.preChatForm.fields;
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600 mb-3">
          Please provide your information to continue:
        </p>
        {fields.map((field) => (
          <div key={field.id} className="mb-3">
            <Label htmlFor={field.id} className="text-xs font-medium mb-1 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={inlineFormData[field.name] || ''}
              onChange={handleInlineInputChange}
              className={`h-8 text-sm ${formErrors[field.name] ? 'border-red-500' : ''}`}
            />
            {formErrors[field.name] && (
              <p className="text-xs text-red-500 mt-1">{formErrors[field.name]}</p>
            )}
          </div>
        ))}
        <Button 
          onClick={submitInlineForm} 
          disabled={!formValid}
          className="w-full h-8 text-sm mt-2"
          style={{
            backgroundColor: config.branding?.primaryColor || '#8B5CF6',
            borderColor: config.branding?.primaryColor || '#8B5CF6'
          }}
        >
          Start Chat
        </Button>
      </div>
    );
  };

  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Assuming we load 20 messages at a time

  // Get avatar URLs from config
  const agentAvatar = conversation.agentInfo?.avatar || config?.branding?.avatarUrl;
  const userAvatar = undefined; // Could be set from user profile if available

  return (
    <div 
      className="flex flex-col h-[600px]"
      style={{
        // Apply custom theme variables if available from config
        ...(config?.branding?.primaryColor && {
          '--chat-header-bg': config.branding.primaryColor,
          '--chat-header-text': '#ffffff',
          '--user-bubble-bg': config.branding.primaryColor,
          '--user-bubble-text': '#ffffff',
          '--system-bubble-bg': '#f3f4f6',
          '--system-bubble-text': '#1f2937',
          '--chat-bg': '#ffffff',
        } as React.CSSProperties)
      }}
    >
      <ChatHeader 
        conversation={conversation} 
        onBack={onBack} 
        onToggleSearch={toggleSearch}
        showSearch={showSearch}
      />
      
      {showSearch && config?.features?.searchMessages && (
        <SearchBar 
          onSearch={searchMessages} 
          onClear={clearSearch} 
          resultCount={messageIds.length}
          isSearching={isSearching}
        />
      )}
      
      <MessageList 
        messages={messages}
        isTyping={isTyping || remoteIsTyping}
        setMessageText={setMessageText}
        readReceipts={readReceipts}
        onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
        searchResults={messageIds}
        highlightMessage={highlightText}
        searchTerm={searchTerm}
        agentAvatar={agentAvatar}
        userAvatar={userAvatar}
        onScrollTop={handleLoadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMore={isLoadingMore}
        inlineFormComponent={showInlineForm ? renderInlineFormFields() : undefined}
      />
      
      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
        disabled={showInlineForm}
      />
    </div>
  );
};

export default ChatView;
