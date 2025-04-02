
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Conversation } from '../types';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onSelectConversation }) => {
  // Function to handle starting a new chat
  const handleStartNewChat = () => {
    // Create a new conversation and select it
    const newConversation: Conversation = {
      id: `new-chat-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '', // Changed from object to string to match Conversation type
      timestamp: new Date(), // Using Date object as expected by the type
      unreadCount: 0
    };
    
    onSelectConversation(newConversation);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Your Conversations</h2>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 
          border-vivid-purple 
          text-vivid-purple 
          hover:bg-vivid-purple 
          hover:text-white 
          hover:border-vivid-purple-600 
          focus:outline-none 
          focus:ring-2 
          focus:ring-vivid-purple-300 
          transition-all 
          duration-300 
          ease-in-out 
          active:scale-95 
          group"
        onClick={handleStartNewChat}
      >
        <MessageSquare 
          className="mr-1.5 
            group-hover:text-white 
            group-hover:scale-105 
            transition-all" 
          size={16} 
        />
        Start a new conversation
      </Button>
      
      <div className="mt-4 space-y-2">
        {/* Placeholder for conversation list */}
        <p className="text-gray-500 text-sm">No conversations yet.</p>
      </div>
    </div>
  );
};

// Make sure to export the component as default
export default MessagesView;
