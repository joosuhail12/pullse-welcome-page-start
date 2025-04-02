
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load conversations from localStorage
    const loadConversations = () => {
      setIsLoading(true);
      try {
        const storedConversations = localStorage.getItem('chat-conversations');
        if (storedConversations) {
          // Parse and convert string timestamps back to Date objects
          const parsedConversations = JSON.parse(storedConversations).map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp)
          }));
          setConversations(parsedConversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    try {
      const updatedConversations = conversations.filter(conv => conv.id !== id);
      setConversations(updatedConversations);
      
      // Update localStorage
      localStorage.setItem('chat-conversations', JSON.stringify(updatedConversations));
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

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

  const handleStartNewChat = () => {
    // Notify the parent component to start a new chat
    onSelectConversation({
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date()
    });
  };

  return (
    <div className="flex flex-col p-2 h-full">
      <div className="mb-3 flex justify-between items-center px-2">
        <h2 className="font-semibold text-gray-700">Recent Conversations</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-vivid-purple hover:text-vivid-purple/90"
          onClick={handleStartNewChat}
        >
          <Plus size={18} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 border-2 border-vivid-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conversation => (
              <div 
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className="p-3 rounded-md hover:bg-soft-purple-50 cursor-pointer border border-gray-100 transition-colors group relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <MessageSquare size={16} className="text-vivid-purple mr-2 flex-shrink-0" />
                    <span className="font-medium text-gray-800 truncate">{conversation.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{conversation.lastMessage || 'No messages yet'}</p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto mb-2 text-gray-400" size={24} />
                <p>No conversations yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-vivid-purple border-vivid-purple"
                  onClick={handleStartNewChat}
                >
                  Start a new conversation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
