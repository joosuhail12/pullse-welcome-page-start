
import React from 'react';
import { Conversation } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation
}) => {
  // Format the timestamp to a relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <li 
            key={conversation.id}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start p-4 space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {conversation.agentInfo?.avatar ? (
                  <img 
                    src={conversation.agentInfo.avatar} 
                    alt={conversation.agentInfo.name || 'Agent'} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-primary text-lg font-semibold">
                    {conversation.agentInfo?.name?.[0] || 'A'}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(conversation.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {conversation.lastMessage}
                </p>
              </div>
              
              {conversation.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
