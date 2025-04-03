
import React from 'react';
import { ArrowLeft, Search, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation } from '../types';
import AgentPresence from './AgentPresence';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TicketProgressBar from './TicketProgressBar';

interface ChatViewHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
  searchMessages: (term: string) => void;
  clearSearch: () => void;
  searchResultCount: number;
  isSearching: boolean;
  showSearchFeature?: boolean;
  ticketProgress?: number;
}

const ChatViewHeader: React.FC<ChatViewHeaderProps> = ({
  conversation,
  onBack,
  showSearch,
  toggleSearch,
  searchMessages,
  clearSearch,
  searchResultCount,
  isSearching,
  showSearchFeature = true,
  ticketProgress,
}) => {
  // Determine ticket status from conversation.status
  const getTicketStatus = () => {
    if (!conversation.status) return 'new';
    
    switch (conversation.status) {
      case 'ended':
        return 'closed';
      case 'active':
        return conversation.isResolved ? 'resolved' : 'in-progress';
      default:
        return 'new';
    }
  };
  
  return (
    <div className="bg-vivid-purple text-white shadow-lg z-20 flex flex-col relative chat-header-pattern">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.3) 2%, transparent 0%), 
                              radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.3) 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}>
        </div>
      </div>
      
      <div className="p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1.5 mr-3 text-white hover:bg-white/20 hover:text-white rounded-full"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </Button>
          
          {!showSearch && (
            <div className="flex-1 flex flex-col justify-center overflow-hidden min-w-0">
              <div className="flex items-center">
                <h3 className="font-semibold truncate text-md text-white">
                  {conversation.title}
                </h3>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 p-1 h-6 w-6 text-white hover:bg-white/20 hover:text-white rounded-full"
                    >
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64 bg-gray-900 text-white border-gray-700">
                    <div className="text-xs">
                      <p className="font-medium">Conversation Details</p>
                      <p className="text-white/80 mt-1">
                        Started on {conversation.timestamp.toLocaleDateString()} at {conversation.timestamp.toLocaleTimeString()}
                      </p>
                      {conversation.status && (
                        <p className="mt-1">
                          Status: <span className="font-semibold capitalize">{conversation.status}</span>
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {conversation.agentInfo?.name && (
                <AgentPresence 
                  agentName={conversation.agentInfo.name} 
                  status={conversation.agentInfo.status} 
                />
              )}
            </div>
          )}
          
          {showSearch && (
            <div className="flex-1 flex items-center">
              <Input
                type="text"
                placeholder="Search messages..."
                className="h-8 bg-white/20 border-0 text-white placeholder:text-white/70 focus-visible:ring-white/30"
                onChange={(e) => searchMessages(e.target.value)}
                autoFocus
              />
              <span className="mx-2 text-xs text-white/90 font-medium">
                {isSearching ? 'Searching...' : searchResultCount > 0 ? `${searchResultCount} results` : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          {showSearchFeature && (
            <Button
              variant="ghost"
              size="sm"
              onClick={showSearch ? clearSearch : toggleSearch}
              className="p-1.5 text-white hover:bg-white/20 hover:text-white rounded-full"
              aria-label={showSearch ? 'Close search' : 'Search messages'}
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Enhanced Ticket Progress Bar */}
      <TicketProgressBar 
        status={getTicketStatus()} 
        className="bg-gradient-to-r from-vivid-purple to-vivid-purple-700"
      />
    </div>
  );
};

export default ChatViewHeader;
