
import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '../types';
import { fetchConversations } from '../services/api';
import { getAccessToken } from '../utils/storage';
import { toast } from 'sonner';
import StatusBadge from '../components/StatusBadge';

interface MessagesViewProps {
  onStartChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onSelectTicket: (ticket: any) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({
  onStartChat,
  onSelectConversation,
  onSelectTicket
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have an access token
        const accessToken = getAccessToken();
        if (!accessToken) {
          setIsLoading(false);
          return;
        }
        
        // Fetch conversations from API
        const response = await fetchConversations();
        
        if (response.status === 'success') {
          if (response.data && Array.isArray(response.data)) {
            setTickets(response.data);
          }
        } else {
          console.error('Failed to fetch conversations:', response.message);
          setError('Could not load conversations. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Could not load conversations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, []);

  const formatLastActive = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Messages</h2>
          <Button
            onClick={onStartChat}
            variant="ghost"
            size="sm"
            className="text-primary"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-gray-500">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : tickets.length === 0 && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet. Start a new chat!</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onStartChat}
            >
              Start new conversation
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {tickets.length > 0 && (
              <div className="mb-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 px-2 mb-1">
                  Support Tickets
                </h3>
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-start gap-3"
                    onClick={() => onSelectTicket(ticket)}
                  >
                    <Avatar className={`h-10 w-10 bg-primary`}>
                      <div className="text-white font-medium">
                        {(ticket.title?.[0] || 'T').toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm truncate">
                          {ticket.title || 'Support Ticket'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatLastActive(ticket.updatedAt || ticket.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <StatusBadge status={ticket.status || 'open'} size="sm" />
                        <p className="text-xs text-gray-500 ml-2 truncate">
                          {ticket.lastMessage ? 
                            ticket.lastMessage.replace(/<[^>]*>/g, '') : 
                            'No messages yet'}
                        </p>
                      </div>
                      {ticket.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 bg-primary text-white text-xs rounded-full mt-1">
                          {ticket.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {conversations.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 px-2 mb-1">
                  Recent Conversations
                </h3>
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-start gap-3"
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10 bg-blue-500">
                      <div className="text-white font-medium">
                        {(conversation.title[0] || 'C').toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default MessagesView;
