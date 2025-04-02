import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Search, 
  SortAsc, 
  SortDesc, 
  Inbox, 
  Calendar,
  ArrowUpDown,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const groupConversationsByDate = (conversations: Conversation[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return conversations.reduce((groups, conversation) => {
    const conversationDate = new Date(conversation.timestamp);
    conversationDate.setHours(0, 0, 0, 0);
    
    let group = 'Older';
    
    if (conversationDate.getTime() === today.getTime()) {
      group = 'Today';
    } else if (conversationDate.getTime() === yesterday.getTime()) {
      group = 'Yesterday';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    
    groups[group].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);
};

const MessagesView = ({ onSelectConversation }: MessagesViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [groupByDate, setGroupByDate] = useState(true);

  useEffect(() => {
    const loadConversations = () => {
      setIsLoading(true);
      try {
        const storedConversations = localStorage.getItem('chat-conversations');
        if (storedConversations) {
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
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    loadConversations();
  }, []);

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      const updatedConversations = conversations.filter(conv => conv.id !== id);
      setConversations(updatedConversations);
      
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
      return `${Math.floor(diff / (1000 * 60))}m ago`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    } else {
      return format(date, 'MMM d');
    }
  };

  const handleStartNewChat = () => {
    onSelectConversation({
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date()
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const toggleGrouping = () => {
    setGroupByDate(!groupByDate);
  };

  const filteredConversations = useMemo(() => {
    let result = [...conversations];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        conv => 
          conv.title.toLowerCase().includes(term) || 
          conv.lastMessage.toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      const timeA = a.timestamp.getTime();
      const timeB = b.timestamp.getTime();
      
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
    
    return result;
  }, [conversations, searchTerm, sortOrder]);
  
  const groupedConversations = useMemo(() => {
    if (!groupByDate) return { ungrouped: filteredConversations };
    return groupConversationsByDate(filteredConversations);
  }, [filteredConversations, groupByDate]);

  const hasNoSearchResults = searchTerm && Object.values(groupedConversations).every(group => group.length === 0);

  const renderSkeletons = () => {
    return Array(3).fill(null).map((_, i) => (
      <div key={`skeleton-${i}`} className="p-3 border border-gray-100 rounded-md">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-4/5 mt-1" />
      </div>
    ));
  };

  const renderConversationItem = (conversation: Conversation) => (
    <div 
      key={conversation.id}
      onClick={() => onSelectConversation(conversation)}
      className="p-3 rounded-md hover:bg-soft-purple-50 cursor-pointer border border-gray-100 transition-colors group relative animate-fade-in"
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
  );

  const renderEmptyState = () => (
    <div className="text-center py-8 animate-fade-in">
      <div className="inline-block rounded-full bg-soft-purple p-4 mb-4">
        <Inbox className="h-8 w-8 text-vivid-purple" />
      </div>
      <p className="text-lg font-semibold text-gray-700">No conversations yet</p>
      <p className="text-gray-500 mb-4">Start a new conversation to get help</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2 border-vivid-purple text-vivid-purple hover:bg-transparent hover:border-vivid-purple/80 transition-all duration-300 ease-in-out group"
        onClick={handleStartNewChat}
      >
        <MessageSquare className="mr-1.5 text-vivid-purple group-hover:text-vivid-purple/80 transition-colors" size={16} />
        <span className="text-vivid-purple group-hover:text-vivid-purple/80 transition-colors">
          Start a new conversation
        </span>
      </Button>
    </div>
  );

  const renderNoSearchResults = () => (
    <div className="text-center py-8 animate-fade-in">
      <div className="inline-block rounded-full bg-gray-100 p-4 mb-4">
        <Search className="h-6 w-6 text-gray-500" />
      </div>
      <p className="text-lg font-semibold text-gray-700">No matching conversations</p>
      <p className="text-gray-500 mb-4">Try a different search term</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setSearchTerm('')}
        className="mt-2"
      >
        <X className="mr-1.5" size={16} />
        Clear search
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 py-1 h-9 text-sm"
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        
        <div className="flex justify-between items-center px-0.5">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-xs px-2 py-1 h-7 ${sortOrder === 'newest' ? 'bg-gray-100' : ''}`}
              onClick={toggleSortOrder}
            >
              {sortOrder === 'newest' ? <SortDesc size={14} /> : <SortAsc size={14} />}
              <span className="ml-1">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-xs px-2 py-1 h-7 ${groupByDate ? 'bg-gray-100' : ''}`}
              onClick={toggleGrouping}
            >
              <Calendar size={14} />
              <span className="ml-1 hidden sm:inline">Group by date</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-vivid-purple hover:text-vivid-purple/90 h-7"
            onClick={handleStartNewChat}
          >
            <Plus size={16} />
            <span className="ml-1 hidden sm:inline">New</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 pb-6">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {renderSkeletons()}
          </div>
        ) : hasNoSearchResults ? (
          renderNoSearchResults()
        ) : filteredConversations.length === 0 ? (
          renderEmptyState()
        ) : (
          <div>
            {groupByDate ? (
              Object.entries(groupedConversations).map(([date, convs]) => 
                convs.length > 0 ? (
                  <div key={date} className="mb-4">
                    <h3 className="text-xs font-medium text-gray-500 mb-2 ml-1">{date}</h3>
                    <div className="space-y-2">
                      {convs.map(renderConversationItem)}
                    </div>
                  </div>
                ) : null
              )
            ) : (
              <div className="space-y-2">
                {filteredConversations.map(renderConversationItem)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
