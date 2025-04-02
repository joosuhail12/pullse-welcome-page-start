
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

const ChatHeader = ({ conversation, onBack }: ChatHeaderProps) => {
  return (
    <div className="border-b p-3 flex items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="mr-2 p-1 h-8 w-8"
      >
        <ChevronLeft size={16} />
      </Button>
      <div className="flex items-center">
        <Avatar className="h-8 w-8">
          {conversation.agentInfo?.avatar ? (
            <AvatarImage src={conversation.agentInfo.avatar} alt="Agent" />
          ) : (
            <AvatarFallback className="bg-vivid-purple text-white">
              {conversation.agentInfo?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="ml-2">
          <h3 className="text-sm font-medium">
            {conversation.agentInfo?.name || 'Agent'}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
