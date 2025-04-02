
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const MessagesView = ({ onSelectConversation }: MessagesViewProps) => {
  // Sample conversations - in a real app, these would come from an API or state management
  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      title: 'Getting Started',
      lastMessage: 'How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 'conv-2',
      title: 'Feature Questions',
      lastMessage: 'Yes, that feature is available in the premium plan.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60 * 60) {
      // Less than an hour ago
      return `${Math.floor(diff / (1000 * 60))}m ago`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      // Less than a day ago
      return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    } else {
      // More than a day ago
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col p-2 h-full">
      <div className="mb-2 flex justify-between items-center px-2">
        <h2 className="font-semibold text-gray-700">Recent Conversations</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-vivid-purple hover:text-vivid-purple/90"
        >
          <Plus size={18} />
        </Button>
      </div>
      
      <div className="space-y-2">
        {conversations.map(conversation => (
          <div 
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="p-3 rounded-md hover:bg-soft-purple-50 cursor-pointer border border-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <MessageSquare size={16} className="text-vivid-purple mr-2" />
                <span className="font-medium text-gray-800">{conversation.title}</span>
              </div>
              <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{conversation.lastMessage}</p>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
