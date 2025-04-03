
import React from 'react';
import { Conversation } from '../types';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from './SearchBar';
import AgentPresence from './AgentPresence';
import { Progress } from '@/components/ui/progress';

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
  testMode?: boolean;
  ticketProgress?: number;
}

const ChatViewHeader: React.FC<ChatViewHeaderProps> = ({ 
  conversation, 
  onBack, 
  showSearch, 
  toggleSearch, 
  searchMessages, 
  clearSearch, 
  searchResultCount = 0, 
  isSearching = false,
  showSearchFeature = false,
  testMode = false,
  ticketProgress
}) => {
  // Get agent details or use defaults
  const agentName = conversation.agentInfo?.name || 'Support Agent';
  const agentStatus = conversation.agentInfo?.status || 'offline';
  const isResolved = conversation.isResolved || false;
  
  return (
    <div className="bg-vivid-purple text-white shadow-sm z-10 relative">
      {showSearch ? (
        <div className="px-2 py-2">
          <SearchBar 
            onSearch={searchMessages || (() => {})} 
            onClear={clearSearch || (() => {})} 
            resultCount={searchResultCount} 
            isSearching={isSearching} 
          />
        </div>
      ) : (
        <>
          <div className="p-2 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                className="p-1 sm:p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white"
                onClick={onBack}
              >
                <ArrowLeft size={16} className="text-white" />
              </Button>
              
              <div>
                <h2 className="font-semibold text-xs sm:text-sm tracking-tight">
                  {conversation.title || 'Support Chat'}
                </h2>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <AgentPresence 
                    workspaceId={conversation.id.split(':')[0]}
                    status={agentStatus}
                  />
                </div>
              </div>
            </div>
            
            {showSearchFeature && toggleSearch && (
              <Button
                variant="ghost"
                className="p-1 sm:p-2 h-auto w-auto text-white hover:bg-white/20 hover:text-white"
                onClick={toggleSearch}
              >
                {showSearch ? <X size={16} /> : <Search size={16} />}
              </Button>
            )}
            
            {testMode && (
              <div className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                TEST MODE
              </div>
            )}
          </div>
          
          {/* Show ticket progress if available */}
          {ticketProgress !== undefined && (
            <div className="px-4 pb-2">
              <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                <span>Progress</span>
                <span>{Math.round(ticketProgress)}%</span>
              </div>
              <Progress value={ticketProgress} className="h-1.5 sm:h-2 w-full bg-white/30" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatViewHeader;
