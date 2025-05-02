import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, ArrowUp, ArrowDown, Info, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Conversation, Ticket } from '../types';
import SearchBar from '../components/SearchBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { loadConversationsFromStorage } from '../utils/storage';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchConversations } from '../services/api';
import { ChatWidgetConfig } from '../config';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onStartChat: () => void;
  config: ChatWidgetConfig;
}

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | 'active' | 'ended' | 'open';
type GroupBy = 'none' | 'date';

const ITEMS_PER_PAGE = 10;

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'mock-1',
    title: 'Support Chat',
    lastMessage: 'Thank you for contacting us. How can we help you today?',
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    status: 'active',
    agentInfo: {
      name: 'Support Agent',
      avatar: undefined
    }
  },
  {
    id: 'mock-2',
    title: 'Technical Support',
    lastMessage: 'Have you tried restarting the application?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: 'ended',
    agentInfo: {
      name: 'Tech Support',
      avatar: undefined
    }
  },
  {
    id: 'mock-3',
    title: 'Billing Inquiry',
    lastMessage: 'Your subscription will renew on the 15th of next month.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'ended',
    agentInfo: {
      name: 'Billing Department',
      avatar: undefined
    }
  }
];

const MessagesView = ({ onSelectConversation, onSelectTicket, onStartChat, config }: MessagesViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Conversation | Ticket)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [animateOut, setAnimateOut] = useState<string | null>(null);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chat_widget_conversations') {
        loadConversationsData();
      }
    };

    const handleCustomStorageChange = (event: CustomEvent) => {
      if (event.detail?.key === 'chat_widget_conversations') {
        loadConversationsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-updated', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-updated', handleCustomStorageChange as EventListener);
    };
  }, []);

  const convertApiTicketsToTickets = useCallback((ticketsData: any[]): Ticket[] => {
    return ticketsData.map(ticket => ({
      id: ticket.id,
      title: ticket.title || 'Untitled Ticket',
      description: ticket.description,
      status: ticket.status || 'open',
      priority: ticket.priority || 0,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lastMessage: ticket.lastMessage,
      lastMessageAt: ticket.lastMessageAt,
      unread: ticket.unread,
      teamId: ticket.teamId,
      deviceId: ticket.deviceId
    }));
  }, []);

  const loadConversationsData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      let retries = 3;
      let conversationsData: Conversation[] = [];
      let ticketsData: Ticket[] = [];

      while (retries > 0) {
        try {
          const response = await fetchConversations();
          if (response && response?.data && response?.data?.length > 0) {
            ticketsData = convertApiTicketsToTickets(response.data);
            setTickets(ticketsData);
          }

          setUseMockData(false);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error('Error loading conversations after retries:', error);
            setUseMockData(true);
            conversationsData = [...MOCK_CONVERSATIONS];
            setLoadingError('Using demo data. Some features may be limited.');
            toast.warning('Using demo data. Real conversations could not be loaded.');
          } else {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setUseMockData(true);
      setConversations([...MOCK_CONVERSATIONS]);
      setLoadingError('Using demo data. Some features may be limited.');
      toast.warning('Using demo data. Real conversations could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [convertApiTicketsToTickets]);

  useEffect(() => {
    loadConversationsData();
  }, [loadConversationsData]);

  const formatDateDisplay = useCallback((date: Date | string): string => {
    return format(new Date(date), 'MMM d, yyyy');
  }, []);

  const formatTime = useCallback((date: Date | string): string => {
    const now = new Date();
    const setDate = new Date(date);
    const diff = now.getTime() - setDate.getTime();

    console.log(diff, date);

    if (diff < 1000 * 60 * 60) {
      return `${Math.floor(diff / (1000 * 60))}m ago`;
    } else if (diff < 1000 * 60 * 60 * 24) {
      return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    } else {
      return format(setDate, 'h:mm a');
    }
  }, []);

  const handleStartNewChat = useCallback(() => {
    onStartChat();
    clearUnreadMessages();
  }, [onStartChat, clearUnreadMessages]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);

    const results = [
      ...conversations.filter(conv =>
        conv.title.toLowerCase().includes(term.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(term.toLowerCase()))
      ),
      ...tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(term.toLowerCase()) ||
        (ticket.lastMessage && ticket.lastMessage.toLowerCase().includes(term.toLowerCase()))
      )
    ];

    setSearchResults(results);
    setIsSearching(false);
  }, [conversations, tickets]);

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, handleSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const dateToTimestamp = (date: Date | string): number => {
    return new Date(date).getTime();
  };

  const groupItems = useCallback((items: (Conversation | Ticket)[]) => {
    if (groupBy === 'none') {
      return { 'All Items': items };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return items.reduce((groups: Record<string, (Conversation | Ticket)[]>, item) => {
      const itemDate = new Date('createdAt' in item ? (item as Conversation).createdAt : (item as Ticket).createdAt);
      itemDate.setHours(0, 0, 0, 0);

      let groupName = 'Older';

      if (itemDate.getTime() === today.getTime()) {
        groupName = 'Today';
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groupName = 'Yesterday';
      } else if (itemDate > lastWeek) {
        groupName = 'This Week';
      } else if (itemDate > lastMonth) {
        groupName = 'This Month';
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(item);
      return groups;
    }, {});
  }, [groupBy]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = searchTerm ? searchResults : [...conversations, ...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        if ('ticketId' in item) {
          return item.status === statusFilter;
        } else {
          return (item as Ticket).status === statusFilter;
        }
      });
    }

    return filtered.sort((a, b) => {
      const aDate = 'createdAt' in a ? dateToTimestamp((a as Conversation).createdAt) : dateToTimestamp((a as Ticket).createdAt);
      const bDate = 'createdAt' in b ? dateToTimestamp((b as Conversation).createdAt) : dateToTimestamp((b as Ticket).createdAt);

      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  }, [conversations, tickets, sortOrder, statusFilter, searchTerm, searchResults]);

  const groupedItems = useMemo(() => {
    return groupItems(filteredAndSortedItems);
  }, [filteredAndSortedItems, groupItems]);

  const orderedGroups = useMemo(() => {
    if (groupBy === 'none') return ['All Items'];

    const priorityOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
    return priorityOrder.filter(group => groupedItems[group] && groupedItems[group].length > 0);
  }, [groupedItems, groupBy]);

  const totalItems = useMemo(() => {
    return filteredAndSortedItems.length;
  }, [filteredAndSortedItems]);

  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    const validCurrentPage = Math.min(currentPage, totalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }

    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

    const pagedGroupedItems: Record<string, (Conversation | Ticket)[]> = {};

    if (groupBy === 'none') {
      pagedGroupedItems['All Items'] = filteredAndSortedItems.slice(startIndex, endIndex);
    } else {
      let currentIdx = 0;

      for (const group of orderedGroups) {
        const groupItems = groupedItems[group];

        if (currentIdx + groupItems.length > startIndex) {
          const groupStartIdx = Math.max(0, startIndex - currentIdx);
          const groupEndIdx = Math.min(groupItems.length, endIndex - currentIdx);

          if (groupStartIdx < groupEndIdx) {
            pagedGroupedItems[group] = groupItems.slice(groupStartIdx, groupEndIdx);
          }
        }

        currentIdx += groupItems.length;

        if (currentIdx >= endIndex) break;
      }
    }

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPage: validCurrentPage,
      pagedGroupedItems
    };
  }, [filteredAndSortedItems, currentPage, groupBy, groupedItems, orderedGroups, totalItems]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRetryLoading = useCallback(() => {
    setUseMockData(false);
    loadConversationsData();
  }, [loadConversationsData]);

  const handleItemSelect = useCallback((item: Conversation | Ticket) => {
    clearUnreadMessages();

    if ('ticketId' in item) {
      onSelectConversation(item);
    } else {
      onSelectTicket(item as Ticket);
    }
  }, [clearUnreadMessages, onSelectConversation, onSelectTicket]);

  const toggleGrouping = useCallback(() => {
    setGroupBy(prev => prev === 'none' ? 'date' : 'none');
  }, []);

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

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500 animate-fade-in">
      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg max-w-xs mx-auto shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <MessageSquare className="mx-auto text-gray-300" size={40} strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
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
                <div className="w-5 h-5 rounded-full bg-vivid-purple/10 flex items-center justify-center text-xs text-vivid-purple">1</div>
                <span>Click the "+" button to start chatting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-vivid-purple/10 flex items-center justify-center text-xs text-vivid-purple">2</div>
                <span>Ask questions or request assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-vivid-purple/10 flex items-center justify-center text-xs text-vivid-purple">3</div>
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
  );

  const renderItem = (item: Conversation | Ticket) => {
    const isTicket = !('ticketId' in item);
    const title = item.title;
    const status = isTicket ? (item as Ticket).status : (item as Conversation).status;
    const createdDate = isTicket
      ? new Date((item as Ticket).createdAt)
      : (item as Conversation).createdAt;
    const lastMessage = isTicket
      ? (item as Ticket).lastMessage || 'No description available'
      : (item as Conversation).lastMessage || 'No messages yet';
    const isUnread = isTicket
      ? Boolean((item as Ticket).unread)
      : (item as Conversation).unread;

    return (
      <Card
        key={item.id}
        onClick={() => handleItemSelect(item)}
        className={`p-3 hover:bg-soft-purple-50 cursor-pointer border bg-white/60 backdrop-blur-sm ${isUnread ? 'border-l-4 border-l-vivid-purple' : 'border-white/30'
          } transition-colors group relative animate-fade-in shadow-sm`}
        tabIndex={0}
        role="button"
        aria-label={`${isTicket ? 'Ticket' : 'Conversation'}: ${title}${isUnread ? ', unread' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleItemSelect(item);
          }
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="relative">
              <MessageSquare size={16} className="text-vivid-purple mr-2 flex-shrink-0" aria-hidden="true" />
              {status && (
                <div
                  className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white"
                  style={{
                    backgroundColor: status === 'active' || status === 'open' ? '#10b981' : '#9ca3af'
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-gray-800 truncate ${isUnread ? 'font-bold' : ''}`}>
                  {title}
                </span>
                {status && (
                  <Badge
                    variant={status === 'active' || status === 'open' ? 'default' : 'secondary'}
                    className={`text-[10px] px-1.5 py-0 ${status === 'active' || status === 'open'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {status === 'active' ? 'Active' : status === 'open' ? 'Open' : 'Ended'}
                  </Badge>
                )}
                {isUnread && (
                  <span className="w-2 h-2 bg-vivid-purple rounded-full" aria-label="Unread conversation"></span>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500">{formatTime(item.createdAt)}</span>
        </div>

        <p className={`text-sm ${isUnread ? 'text-gray-700' : 'text-gray-500'} mt-1.5 ml-6 line-clamp-1 font-normal`}>
          {lastMessage}
        </p>

        <div className="flex items-center gap-1 ml-6 mt-2 text-xs text-gray-400">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                <span>Started {formatDateDisplay(item.createdAt)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>Created on {format(new Date(item.createdAt), 'MMMM d, yyyy')} at {format(new Date(item.createdAt), 'h:mm a')}</div>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    );
  };

  return (
    <div
      style={{
        backgroundColor: config.colors?.backgroundColor || 'transparent'
      }}
      className={`
      flex flex-col p-2 h-full
      ${!config.colors?.backgroundColor && 'bg-gradient-to-br from-soft-purple-50 to-soft-purple-100'}
    `}
    >
      {/* // <div className="flex flex-col p-2 h-full bg-gradient-to-br from-soft-purple-50 to-soft-purple-100"> */}
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
        resultCount={searchTerm ? filteredAndSortedItems.length : 0}
        isSearching={isSearching}
      />

      {loadingError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-2 rounded-md mb-2 flex items-center">
          <Info size={14} className="mr-1.5 flex-shrink-0" />
          <span className="flex-1">{loadingError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 px-2 py-0 text-xs hover:bg-yellow-100"
            onClick={handleRetryLoading}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between px-2 py-2 bg-white/60 backdrop-blur-sm rounded-md mb-2 shadow-sm" role="toolbar" aria-label="Conversation sorting and filtering options">
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-vivid-purple hover:bg-vivid-purple/10"
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
          className="h-8 gap-1 text-xs text-vivid-purple hover:bg-vivid-purple/10"
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
        ) : filteredAndSortedItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 px-1">
            {Object.keys(paginationData.pagedGroupedItems).length === 0 ? (
              <EmptyState />
            ) : (
              Object.entries(paginationData.pagedGroupedItems).map(([group, groupItems]) => (
                <div key={group} className="mb-4">
                  {groupBy !== 'none' && (
                    <div className="text-xs font-medium text-vivid-purple mb-2 px-2"
                      role="heading" aria-level={2}>
                      {group}
                    </div>
                  )}
                  <div className="space-y-2">
                    {groupItems.map((item) => renderItem(item))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {paginationData?.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent role="navigation" aria-label="Conversation pagination">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, paginationData.currentPage - 1))}
                aria-disabled={paginationData.currentPage === 1}
                className={`${paginationData.currentPage === 1 ? "pointer-events-none opacity-50" : ""} text-vivid-purple hover:bg-vivid-purple/10`}
                aria-label="Previous page"
              />
            </PaginationItem>

            {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === paginationData.currentPage}
                  onClick={() => handlePageChange(page)}
                  aria-current={page === paginationData.currentPage ? "page" : undefined}
                  aria-label={`Page ${page}`}
                  className={page === paginationData.currentPage ? "bg-vivid-purple text-white hover:bg-vivid-purple/90" : "hover:bg-vivid-purple/10 text-vivid-purple"}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(paginationData.totalPages, paginationData.currentPage + 1))}
                aria-disabled={paginationData.currentPage === paginationData.totalPages}
                className={`${paginationData.currentPage === paginationData.totalPages ? "pointer-events-none opacity-50" : ""} text-vivid-purple hover:bg-vivid-purple/10`}
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
