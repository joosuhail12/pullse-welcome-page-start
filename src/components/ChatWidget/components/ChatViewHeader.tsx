
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
}) => {
  // Determine ticket status from conversation.status
  // This is placeholder logic since we don't have real ticket status in the data model
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
    <div className="bg-vivid-purple text-white shadow-md z-20 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 mr-2 text-white hover:bg-white/20 hover:text-white"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </Button>
          
          {!showSearch && (
            <div className="flex-1 flex flex-col justify-center overflow-hidden min-w-0">
              <div className="flex items-center">
                <h3 className="font-semibold truncate text-md">
                  {conversation.title}
                </h3>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 p-1 h-6 w-6 text-white/80 hover:bg-white/20 hover:text-white"
                    >
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64">
                    <div className="text-xs">
                      <p className="font-medium">Conversation Details</p>
                      <p className="text-muted-foreground mt-1">
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
                className="h-8 bg-white/20 border-0 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                onChange={(e) => searchMessages(e.target.value)}
                autoFocus
              />
              <span className="mx-2 text-xs text-white/80">
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
              className="p-1.5 text-white hover:bg-white/20 hover:text-white"
              aria-label={showSearch ? 'Close search' : 'Search messages'}
            >
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Ticket Progress Bar */}
      <TicketProgressBar 
        status={getTicketStatus()} 
        className="bg-vivid-purple/90"
      />
    </div>
  );
};

export default ChatViewHeader;
