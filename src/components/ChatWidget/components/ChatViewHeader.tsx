
import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '../types';
import { ArrowLeft, Search, X, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import AgentPresence from './AgentPresence';

interface ChatViewHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  showSearch?: boolean;
  toggleSearch?: () => void;
  searchMessages?: (term: string) => void;
  clearSearch?: () => void;
  searchResultCount?: number;
  isSearching?: boolean;
  showSearchFeature?: boolean;
  ticketProgress?: number;
}

const ChatViewHeader: React.FC<ChatViewHeaderProps> = ({
  conversation,
  onBack,
  showSearch = false,
  toggleSearch,
  searchMessages,
  clearSearch,
  searchResultCount = 0,
  isSearching = false,
  showSearchFeature = false,
  ticketProgress
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = () => {
    if (searchMessages && searchTerm) {
      searchMessages(searchTerm);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchMessages) {
      searchMessages(searchTerm);
    } else if (e.key === 'Escape' && toggleSearch) {
      toggleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (clearSearch) clearSearch();
  };

  // Agent information from conversation
  const agentName = conversation.agentInfo?.name || 'Support';
  const agentStatus = conversation.agentInfo?.status || 'online';
  
  return (
    <div className="bg-vivid-purple text-white p-2 sm:p-4 shadow-sm z-10">
      {showSearch ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={toggleSearch}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-grow relative">
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full"
              onKeyDown={handleKeyDown}
            />
            
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute right-1 top-1 text-white/70 hover:text-white hover:bg-white/20"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            className="h-8 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? '...' : 'Search'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
                onClick={onBack}
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col text-sm">
                <h2 className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[200px]">
                  {conversation.title || "Support Chat"}
                </h2>
                <AgentPresence 
                  workspaceId={conversation.id.split(':')[0]} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {showSearchFeature && toggleSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem className="flex justify-between">
                    <span>Status</span>
                    <span className="text-right font-medium">
                      {conversation.status === 'ended' || conversation.status === 'closed' ? 'Closed' : 'Active'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex justify-between">
                    <span>Created</span>
                    <span className="text-right font-medium">
                      {conversation.createdAt.toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {ticketProgress !== undefined && (
            <div className="px-2">
              <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                <span>Ticket Progress</span>
                <span>{Math.round(ticketProgress)}%</span>
              </div>
              <Progress value={ticketProgress} className="h-1.5 sm:h-2 w-full bg-white/30" />
            </div>
          )}
        </div>
      )}
      
      {showSearch && searchResultCount > 0 && (
        <div className="text-xs mt-2 text-white/80">
          {searchResultCount} {searchResultCount === 1 ? 'result' : 'results'} found
        </div>
      )}
    </div>
  );
};

export default ChatViewHeader;
