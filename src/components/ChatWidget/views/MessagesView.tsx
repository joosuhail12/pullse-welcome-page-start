
import React, { useState, useMemo } from 'react';
import { Conversation } from '../types';
import ConversationList from '../components/ConversationList';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample conversations (in a real app, these would come from an API)
  const conversations = useMemo(() => [
    {
      id: 'conv-1',
      title: 'Customer Support',
      lastMessage: 'How can we help you today?',
      timestamp: new Date(),
      status: 'active' as const,
      agentInfo: {
        name: 'Support Agent',
        avatar: undefined,
      },
      // Add required conversation properties
      messages: [],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'conv-2',
      title: 'Previous Conversation',
      lastMessage: 'Thank you for contacting us!',
      timestamp: new Date(Date.now() - 864000000), // 10 days ago
      status: 'ended' as const,
      agentInfo: {
        name: 'Alex Support',
        avatar: undefined,
      },
      // Add required conversation properties
      messages: [],
      unreadCount: 0,
      createdAt: new Date(Date.now() - 864000000),
      updatedAt: new Date(Date.now() - 864000000)
    },
    {
      id: 'conv-3',
      title: 'Product Inquiry',
      lastMessage: 'The product should be back in stock next week.',
      timestamp: new Date(Date.now() - 1728000000), // 20 days ago
      status: 'ended' as const,
      agentInfo: {
        name: 'Product Support',
        avatar: undefined,
      },
      // Add required conversation properties
      messages: [],
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1728000000),
      updatedAt: new Date(Date.now() - 1728000000)
    }
  ], []);
  
  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return conversations.filter(conv => {
      return (
        conv.title.toLowerCase().includes(lowercaseSearch) ||
        conv.lastMessage.toLowerCase().includes(lowercaseSearch) ||
        (conv.agentInfo?.name && conv.agentInfo.name.toLowerCase().includes(lowercaseSearch))
      );
    });
  }, [conversations, searchTerm]);
  
  // Handle search term changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  // Handle starting a new conversation
  const handleStartNewConversation = () => {
    // In a real app, this would create a new conversation via an API
    const newConversation: Conversation = {
      id: `conv-new-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: 'How can we help you today?',
      timestamp: new Date(),
      status: 'active',
      // Add required conversation properties
      messages: [],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onSelectConversation(newConversation);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <SearchBar
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={handleSearch}
          onClear={clearSearch}
        />
      </div>
      
      {filteredConversations.length > 0 ? (
        <ConversationList
          conversations={filteredConversations}
          onSelectConversation={onSelectConversation}
        />
      ) : (
        <EmptyState
          title={searchTerm ? "No matching conversations" : "No conversations yet"}
          description={searchTerm ? "Try a different search term" : "Start a new conversation to get help"}
          actionLabel="Start new conversation"
          onAction={handleStartNewConversation}
        />
      )}
    </div>
  );
};

export default MessagesView;
