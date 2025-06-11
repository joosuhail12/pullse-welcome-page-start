
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Search, X } from 'lucide-react';
import { Conversation, Ticket } from '../types';
import { ChatWidgetConfig } from '../config';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { ticketService, conversationService } from '../services/api';
import { dispatchChatEvent } from '../utils/events';
import { getWorkspaceIdAndApiKey } from '../utils/storage';
import LoadingIndicator from '../components/LoadingIndicator';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onStartChat: () => void;
  config: ChatWidgetConfig;
  isDemo?: boolean;
}

const MessagesView: React.FC<MessagesViewProps> = ({
  onSelectConversation,
  onSelectTicket,
  onStartChat,
  config,
  isDemo = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Demo data for when isDemo is true
  const demoConversations: Conversation[] = useMemo(() => [
    {
      id: "demo-conversation-1",
      title: "Demo Conversation - All Message Types",
      createdAt: new Date(),
      status: "active",
      lastMessage: "You're very welcome! Is there anything else I can help you with today?",
      timestamp: new Date(),
      unread: false,
      ticketId: "demo-ticket-1",
      sessionId: "demo-session-1",
      agentInfo: {
        id: "demo-agent-1",
        name: "Demo Agent",
        avatar: "https://via.placeholder.com/40x40/6366f1/ffffff?text=DA",
        email: "demo@example.com",
        status: "online"
      },
      rating: 5
    }
  ], []);

  // Get workspace info
  const { workspaceId } = getWorkspaceIdAndApiKey();

  // Fetch conversations/tickets only if not in demo mode
  const { data: tickets = [], isLoading: ticketsLoading, error: ticketsError } = useQuery({
    queryKey: ['tickets', workspaceId],
    queryFn: () => ticketService.getTickets(),
    enabled: !isDemo && !!workspaceId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', workspaceId],
    queryFn: () => conversationService.getConversations(),
    enabled: !isDemo && !!workspaceId,
    refetchInterval: 30000,
  });

  // Use demo data if in demo mode, otherwise use real data
  const displayConversations = isDemo ? demoConversations : conversations;
  const displayTickets = isDemo ? [] : tickets;
  const isLoading = isDemo ? false : (ticketsLoading || conversationsLoading);

  // Combine and filter conversations and tickets based on search term
  const filteredItems = useMemo(() => {
    const allItems = [
      ...displayConversations.map(conv => ({ ...conv, type: 'conversation' as const })),
      ...displayTickets.map(ticket => ({ ...ticket, type: 'ticket' as const }))
    ];

    if (!searchTerm.trim()) return allItems;

    return allItems.filter(item => {
      const title = item.title?.toLowerCase() || '';
      const lastMessage = 'lastMessage' in item ? item.lastMessage?.toLowerCase() || '' : '';
      const search = searchTerm.toLowerCase();
      return title.includes(search) || lastMessage.includes(search);
    });
  }, [displayConversations, displayTickets, searchTerm]);

  const handleItemClick = useCallback((item: any) => {
    if (item.type === 'conversation') {
      onSelectConversation(item);
      dispatchChatEvent('conversation_selected', { conversationId: item.id });
    } else {
      onSelectTicket(item);
      dispatchChatEvent('ticket_selected', { ticketId: item.id });
    }
  }, [onSelectConversation, onSelectTicket]);

  const handleStartNewChat = useCallback(() => {
    onStartChat();
    dispatchChatEvent('new_chat_started', {});
  }, [onStartChat]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchTerm('');
    }
  }, [showSearch]);

  const formatTimestamp = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!isDemo && ticketsError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 mb-2">Failed to load conversations</div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-soft-purple-50 to-soft-purple-100">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="h-8 w-8 p-0"
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </Button>
            <Button
              onClick={handleStartNewChat}
              size="sm"
              className="h-8 px-3"
              style={config.colors?.primaryColor ? { backgroundColor: config.colors.primaryColor } : {}}
            >
              <Plus size={14} className="mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="mt-2">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start a new conversation to get help from our team'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleStartNewChat}>
                  Start New Conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200/50 hover:shadow-sm"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {'agentInfo' in item && item.agentInfo?.avatar ? (
                      <img 
                        src={item.agentInfo.avatar} 
                        alt="Agent"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <MessageSquare size={16} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {'unread' in item && item.unread && (
                          <Badge variant="destructive" className="h-5 text-xs">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp('createdAt' in item ? item.createdAt : item.timestamp || new Date())}
                        </span>
                      </div>
                    </div>
                    
                    {'lastMessage' in item && item.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {item.lastMessage}
                      </p>
                    )}

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={'status' in item && item.status === 'active' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {'status' in item ? item.status : item.type}
                      </Badge>
                      
                      {'agentInfo' in item && item.agentInfo && (
                        <span className="text-xs text-gray-500">
                          with {item.agentInfo.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessagesView;
