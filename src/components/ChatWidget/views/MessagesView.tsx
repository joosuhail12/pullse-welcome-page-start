
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Trash2, ArrowUp, ArrowDown, Info, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Conversation } from '../types';
import SearchBar from '../components/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { loadConversationsFromStorage, deleteConversationFromStorage } from '../utils/storage';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
}

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'ended';
type GroupBy = 'none' | 'date';

const ITEMS_PER_PAGE = 10;

const MessagesView = ({ onSelectConversation }: MessagesViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [animateOut, setAnimateOut] = useState<string | null>(null);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();

  // Storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chat_widget_conversations') {
        loadConversationsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadConversationsData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      // Adding error handling with retry logic
      let retries = 3;
      let conversationsData: Conversation[] = [];
      
      while (retries > 0) {
        try {
          conversationsData = loadConversationsFromStorage();
          break; // Success, exit the retry loop
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw error; // No more retries, throw the error
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
        }
      }

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoadingError('Failed to load conversations. Please try again.');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversationsData();
  }, [loadConversationsData]);

  const handleDeleteConversation = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    // Set animate out class for the conversation being deleted
    setAnimateOut(id);
    
    // Wait for animation to complete before actually deleting
    setTimeout(async () => {
      try {
        // Delete from storage with error handling
        await deleteConversationFromStorage(id);
        
        // Update local state
        setConversations(prev => prev.filter(conv => conv.id !== id));
        toast.success('Conversation deleted');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation. Please try again.');
        // Reset animation if deletion fails
        setAnimateOut(null);
      }
    }, 300); // Match animation duration
  }, []);

  const formatDateDisplay = useCallback((date: Date): string => {
    return format(date, 'MMM d, yyyy');
  }, []);

  const formatTime = useCallback((date: Date): string => {
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
      return format(date, 'h:mm a');
    }
  }, []);

  const handleStartNewChat = useCallback(() => {
    // Notify the parent component to start a new chat
    onSelectConversation({
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      status: 'active' // Set default status for new conversations
    });
    
    // Clear unread message count
    clearUnreadMessages();
  }, [onSelectConversation, clearUnreadMessages]);

  // Handle search functionality with debouncing
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

  // Optimized with debounce
  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, handleSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  // Group conversations by date
  const groupConversations = useCallback((conversations: Conversation[]) => {
    if (groupBy === 'none') {
      return { 'All Conversations': conversations };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return conversations.reduce((groups: Record<string, Conversation[]>, conversation) => {
      const convoDate = new Date(conversation.timestamp);
      convoDate.setHours(0, 0, 0, 0);
      
      let groupName = 'Older';
      
      if (convoDate.getTime() === today.getTime()) {
        groupName = 'Today';
      } else if (convoDate.getTime() === yesterday.getTime()) {
        groupName = 'Yesterday';
      } else if (convoDate > lastWeek) {
        groupName = 'This Week';
      } else if (convoDate > lastMonth) {
        groupName = 'This Month';
      }
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(conversation);
      return groups;
    }, {});
  }, [groupBy]);

  // Apply sorting and filtering - memoized to prevent unnecessary recalculations
  const filteredAndSortedConversations = useMemo(() => {
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

  // Group the conversations
  const groupedConversations = useMemo(() => {
    return groupConversations(filteredAndSortedConversations);
  }, [filteredAndSortedConversations, groupConversations]);

  // Get all groups in order
  const orderedGroups = useMemo(() => {
    if (groupBy === 'none') return ['All Conversations'];
    
    const priorityOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
    return priorityOrder.filter(group => groupedConversations[group] && groupedConversations[group].length > 0);
  }, [groupedConversations, groupBy]);
  
  // Calculate total items across all groups
  const totalItems = useMemo(() => {
    return filteredAndSortedConversations.length;
  }, [filteredAndSortedConversations]);

  // Pagination calculation - memoized
  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    
    // Ensure current page is valid
    const validCurrentPage = Math.min(currentPage, totalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    // Create paged grouped conversations
    const pagedGroupedConversations: Record<string, Conversation[]> = {};
    
    if (groupBy === 'none') {
      pagedGroupedConversations['All Conversations'] = filteredAndSortedConversations.slice(startIndex, endIndex);
    } else {
      let currentIdx = 0;
      
      for (const group of orderedGroups) {
        const groupConversations = groupedConversations[group];
        
        // If we're past our start index, start including conversations
        if (currentIdx + groupConversations.length > startIndex) {
          const groupStartIdx = Math.max(0, startIndex - currentIdx);
          const groupEndIdx = Math.min(groupConversations.length, endIndex - currentIdx);
          
          if (groupStartIdx < groupEndIdx) {
            pagedGroupedConversations[group] = groupConversations.slice(groupStartIdx, groupEndIdx);
          }
        }
        
        currentIdx += groupConversations.length;
        
        // If we've reached our end index, stop
        if (currentIdx >= endIndex) break;
      }
    }
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPage: validCurrentPage,
      pagedGroupedConversations
    };
  }, [filteredAndSortedConversations, currentPage, groupBy, groupedConversations, orderedGroups, totalItems]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Retry loading data
  const handleRetryLoading = useCallback(() => {
    loadConversationsData();
  }, [loadConversationsData]);

  // Handle selecting a conversation - also clears unread count
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    clearUnreadMessages();
    onSelectConversation(conversation);
  }, [clearUnreadMessages, onSelectConversation]);

  // Toggle grouping
  const toggleGrouping = useCallback(() => {
    setGroupBy(prev => prev === 'none' ? 'date' : 'none');
  }, []);

  // Loading skeletons for conversation items
  const renderSkeletons = () => (
    <div className="space-y-3">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-start space-x-2 p-3 border rounded-md">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col p-2 h-full">
      <div className="mb-3 flex justify-between items-center px-2">
        <h2 className="font-semibold text-gray-700" id="messagesViewTitle">Recent Conversations</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-vivid-purple hover:text-vivid-purple/90 relative"
              onClick={handleStartNewChat}
              aria-label={`Start new conversation${unreadCount > 0 ? `. ${unreadCount} unread messages` : ''}`}
            >
              <Plus size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Start a new conversation
          </TooltipContent>
        </Tooltip>
      </div>

      <SearchBar 
        onSearch={handleSearch}
        onClear={clearSearch}
        resultCount={searchTerm ? filteredAndSortedConversations.length : 0}
        isSearching={isSearching}
      />
      
      <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-md mb-2" role="toolbar" aria-label="Conversation sorting and filtering options">
        <div className="flex items-center gap-2">
          <Select 
            value={statusFilter} 
            onValueChange={(value: StatusFilter) => setStatusFilter(value)}
            aria-label="Filter by status"
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
            onClick={toggleGrouping}
            aria-pressed={groupBy !== 'none'}
            aria-label={`${groupBy === 'none' ? 'Group by date' : 'Remove grouping'}`}
          >
            {groupBy === 'none' ? 'Group by Date' : 'No Grouping'}
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1 text-xs"
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          aria-label={`Sort by ${sortOrder === 'newest' ? 'oldest first' : 'newest first'}`}
        >
          {sortOrder === 'newest' ? (
            <>Newest <ArrowDown size={14} /></>
          ) : (
            <>Oldest <ArrowUp size={14} /></>
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1" role="region" aria-label="Conversations list">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {renderSkeletons()}
          </div>
        ) : loadingError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-gray-700 mb-2">{loadingError}</p>
            <Button variant="outline" size="sm" onClick={handleRetryLoading}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            {Object.keys(paginationData.pagedGroupedConversations).length === 0 ? (
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
                    aria-label="Start a new conversation"
                  >
                    <Plus size={16} className="mr-1" />
                    Start a new conversation
                  </Button>
                </div>
              </div>
            ) : (
              Object.entries(paginationData.pagedGroupedConversations).map(([group, groupConversations]) => (
                <div key={group} className="mb-4">
                  {groupBy !== 'none' && (
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2" 
                      role="heading" aria-level={2}>
                      {group}
                    </div>
                  )}
                  <div className="space-y-2">
                    {groupConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-3 hover:bg-soft-purple-50 cursor-pointer border ${
                          conversation.unread ? 'border-l-4 border-l-vivid-purple' : 'border-gray-100'
                        } transition-colors group relative ${
                          animateOut === conversation.id ? 'animate-fade-out' : 'animate-fade-in'
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Conversation: ${conversation.title}${conversation.unread ? ', unread' : ''}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelectConversation(conversation);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="relative">
                              <MessageSquare size={16} className="text-vivid-purple mr-2 flex-shrink-0" aria-hidden="true" />
                              {conversation.status && (
                                <div 
                                  className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white" 
                                  style={{
                                    backgroundColor: conversation.status === 'active' ? '#10b981' : '#9ca3af'  
                                  }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-gray-800 truncate ${conversation.unread ? 'font-bold' : ''}`}>
                                  {conversation.title}
                                </span>
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
                                {conversation.unread && (
                                  <span className="w-2 h-2 bg-vivid-purple rounded-full" aria-label="Unread conversation"></span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatTime(conversation.timestamp)}</span>
                        </div>
                        
                        <p className={`text-sm ${conversation.unread ? 'text-gray-700' : 'text-gray-500'} mt-1.5 ml-6 line-clamp-1 font-normal`}>
                          {conversation.lastMessage || 'No messages yet'}
                        </p>

                        {/* Start date display with tooltip */}
                        <div className="flex items-center gap-1 ml-6 mt-2 text-xs text-gray-400">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>Started {formatDateDisplay(conversation.timestamp)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Created on {format(conversation.timestamp, 'MMMM d, yyyy')} at {format(conversation.timestamp, 'h:mm a')}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              aria-label={`Delete conversation: ${conversation.title}`}
                            >
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Delete conversation
                          </TooltipContent>
                        </Tooltip>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Pagination controls */}
      {paginationData.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent role="navigation" aria-label="Conversation pagination">
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, paginationData.currentPage - 1))}
                aria-disabled={paginationData.currentPage === 1}
                className={paginationData.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                aria-label="Previous page"
              />
            </PaginationItem>
            
            {/* Generate page numbers */}
            {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === paginationData.currentPage}
                  onClick={() => handlePageChange(page)}
                  aria-current={page === paginationData.currentPage ? "page" : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(paginationData.totalPages, paginationData.currentPage + 1))}
                aria-disabled={paginationData.currentPage === paginationData.totalPages}
                className={paginationData.currentPage === paginationData.totalPages ? "pointer-events-none opacity-50" : ""}
                aria-label="Next page"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default React.memo(MessagesView);
