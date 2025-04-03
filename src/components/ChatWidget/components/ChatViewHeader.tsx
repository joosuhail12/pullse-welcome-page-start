
import React, { useState } from 'react';
import { Conversation } from '../types';
import { ArrowLeft, Search, X, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import AgentPresence from './AgentPresence';

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
  ticketProgress
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchMessages(value);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
  };
  
  return (
    <header className="bg-vivid-purple text-white p-2 sm:p-4 flex flex-col shadow-sm z-10">
      <div className="flex items-center justify-between">
        {showSearch ? (
          <div className="flex items-center flex-1 space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white" 
              onClick={toggleSearch}
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="h-8 bg-white/20 border-0 focus-visible:ring-white/30 text-white placeholder:text-white/70 text-sm"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute right-1 top-1 text-white/70 hover:text-white"
                  onClick={handleClearSearch}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            {searchResultCount > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {searchResultCount}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="p-1 sm:p-2 h-auto w-auto text-white hover:bg-white/20 mr-2"
                onClick={onBack}
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <div className="flex items-center">
                  <h2 className="font-medium text-sm sm:text-base">
                    {conversation.title || 'Chat'}
                  </h2>
                  {conversation.isResolved && (
                    <span className="ml-2 flex items-center px-1.5 py-0.5 text-[10px] rounded-full bg-green-500/20 text-white">
                      <Check size={10} className="mr-1" />
                      Resolved
                    </span>
                  )}
                </div>
                
                <AgentPresence 
                  workspaceId={conversation.id.split(':')[0]} 
                  status={conversation.agentInfo?.status} 
                />
              </div>
            </div>
            
            {showSearchFeature && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleSearch}
              >
                <Search size={16} />
              </Button>
            )}
          </>
        )}
      </div>
      
      {/* Ticket progress bar */}
      {ticketProgress !== undefined && (
        <div className="mt-2 px-2">
          <div className="flex justify-between text-[10px] sm:text-xs mb-1">
            <span>Request Progress</span>
            <span>{Math.round(ticketProgress)}%</span>
          </div>
          <Progress value={ticketProgress} className="h-1.5 sm:h-2 w-full bg-white/30" />
        </div>
      )}
      
      {/* Search indicator */}
      {isSearching && (
        <div className="mt-1 flex justify-center">
          <span className="text-xs animate-pulse">Searching...</span>
        </div>
      )}
    </header>
  );
};

export default ChatViewHeader;
