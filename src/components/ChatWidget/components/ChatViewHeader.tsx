
import React from 'react';
import { ArrowLeft, Search, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation, AgentStatus } from '../types';
import AgentPresence from './AgentPresence';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TicketProgressBar from './TicketProgressBar';
import { ChatWidgetConfig } from '../config';
interface ChatViewHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  showSearch: boolean;
  config: ChatWidgetConfig;
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
  config,
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
    <div className="bg-vivid-purple text-black shadow-lg z-20 flex flex-col relative chat-header-pattern">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.3) 2%, transparent 0%), 
                              radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.3) 2%, transparent 0%)`,
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
            className="p-1.5 mr-3 text-black hover:bg-black/20 hover:text-black rounded-full"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </Button>

          {!showSearch && (
            <div className="flex-1 flex flex-col justify-center overflow-hidden min-w-0">
              <div className="flex items-center">
                <h3 className="font-semibold truncate text-md text-black">
                  {conversation.title}
                </h3>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-1 h-6 w-6 text-black hover:bg-black/20 hover:text-black rounded-full"
                    >
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64 bg-white text-black border-gray-300">
                    <div className="text-xs">
                      <p className="font-medium">Conversation Details</p>
                      <p className="text-black/80 mt-1">
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

              {config.interfaceSettings?.showAgentPresence && conversation.agentInfo?.name && (
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
                className="h-8 bg-black/10 border-0 text-black placeholder:text-black/70 focus-visible:ring-black/30"
                onChange={(e) => searchMessages(e.target.value)}
                autoFocus
              />
              <span className="mx-2 text-xs text-black/90 font-medium">
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
              className="p-1.5 text-black hover:bg-black/20 hover:text-black rounded-full"
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
        className="bg-gradient-to-r from-black/10 to-black/20"
      />
    </div>
  );
};

export default ChatViewHeader;
