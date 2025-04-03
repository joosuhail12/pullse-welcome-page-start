
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Trash2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Conversation } from '../types';
import SearchBar from '../components/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'ended';

const MessagesView = ({ onSelectConversation }: MessagesViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
      timestamp: new Date(),
      status: 'active' // Set default status for new conversations
    });
  };

  // Handle search functionality
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    const results = conversations.filter(conv => 
      conv.title.toLowerCase().includes(term.toLowerCase()) || 
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(term.toLowerCase()))
    );
    
    setSearchResults(results);
    setIsSearching(false);
  }, [conversations]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  // Apply sorting and filtering
  const filteredAndSortedConversations = useCallback(() => {
    // First apply the search filter if there's a search term
    let filtered = searchTerm ? searchResults : [...conversations];
    
    // Then apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }
    
    // Finally sort the results
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
    });
  }, [conversations, sortOrder, statusFilter, searchTerm, searchResults]);

  const displayedConversations = filteredAndSortedConversations();

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

      <SearchBar 
        onSearch={handleSearch}
        onClear={clearSearch}
        resultCount={searchTerm ? displayedConversations.length : 0}
        isSearching={isSearching}
      />
      
      <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-md mb-2">
        <Select 
          value={statusFilter} 
          onValueChange={(value: StatusFilter) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1 text-xs"
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
        >
          {sortOrder === 'newest' ? (
            <>Newest <ArrowDown size={14} /></>
          ) : (
            <>Oldest <ArrowUp size={14} /></>
          )}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 border-2 border-vivid-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedConversations.map(conversation => (
              <Card
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className="p-3 hover:bg-soft-purple-50 cursor-pointer border border-gray-100 transition-colors group relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="relative">
                      <MessageSquare size={16} className="text-vivid-purple mr-2 flex-shrink-0" />
                      {conversation.status && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white" 
                          style={{
                            backgroundColor: conversation.status === 'active' ? '#10b981' : '#9ca3af'  
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 truncate">{conversation.title}</span>
                        {conversation.status && (
                          <Badge 
                            variant={conversation.status === 'active' ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 ${
                              conversation.status === 'active' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {conversation.status === 'active' ? 'Active' : 'Ended'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1.5 ml-6 line-clamp-1 font-normal">{conversation.lastMessage || 'No messages yet'}</p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                >
                  <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                </Button>
              </Card>
            ))}

            {displayedConversations.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500 animate-fade-in">
                <div className="bg-gray-50 p-6 rounded-lg max-w-xs mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <MessageSquare className="mx-auto text-gray-300" size={40} strokeWidth={1.5} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center">
                        <Plus className="text-vivid-purple" size={18} />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-700 mb-2">No conversations found</h3>
                  {searchTerm ? (
                    <p className="text-sm mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                  ) : statusFilter !== 'all' ? (
                    <p className="text-sm mb-4">No {statusFilter} conversations found. Try changing your filter.</p>
                  ) : (
                    <>
                      <p className="text-sm mb-4">Start your first conversation to receive support or information.</p>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">1</div>
                          <span>Click the "+" button to start chatting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</div>
                          <span>Ask questions or request assistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</div>
                          <span>Get answers from our support team</span>
                        </div>
                      </div>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 mx-auto text-vivid-purple border-vivid-purple hover:text-vivid-purple/90 hover:bg-vivid-purple/5"
                    onClick={handleStartNewChat}
                  >
                    <Plus size={16} className="mr-1" />
                    Start a new conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
