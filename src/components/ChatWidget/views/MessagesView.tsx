
// Update MessagesView to show connection status
import React, { useEffect, useState } from 'react';
import { getMockConversations } from '../utils/messageHandlers';
import { ChatWidgetConfig, defaultConfig, ChatWidgetViews } from '../config';
import { ChatEventType } from '../config';
import TabBar from '../components/TabBar';
import { Conversation } from '../types';
import { getSessionConversations } from '../utils/storage';
import { dispatchChatEvent } from '../utils/events';
import { ConnectionStatus } from '../utils/reconnectionManager';
import ConnectionStatusIndicator from '../components/ConnectionStatusIndicator';

interface MessagesViewProps {
  onSelect: (conversation: Conversation) => void;
  onChangeView: (view: ChatWidgetViews) => void;
  onStartChat: () => void;
  config?: ChatWidgetConfig;
  connectionStatus?: ConnectionStatus;
}

const MessagesView: React.FC<MessagesViewProps> = ({
  onSelect,
  onChangeView,
  onStartChat,
  config = defaultConfig,
  connectionStatus = ConnectionStatus.CONNECTED
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = () => {
      setIsLoading(true);
      
      try {
        const loadedConversations = getSessionConversations();
        
        // If no conversations found, use mock data for demo purposes
        if (loadedConversations.length === 0) {
          setConversations(getMockConversations());
        } else {
          setConversations(loadedConversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations(getMockConversations());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
    
    // Listen for storage changes in other tabs
    const handleStorageChange = () => {
      loadConversations();
    };
    
    window.addEventListener('storage-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
    };
  }, []);

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    onSelect(conversation);
    dispatchChatEvent('chat:conversationSelected' as ChatEventType, { conversationId: conversation.id }, config);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium">{config.messages?.title || 'Messages'}</h2>
        
        {connectionStatus !== ConnectionStatus.CONNECTED && (
          <ConnectionStatusIndicator 
            status={connectionStatus}
            variant="icon-only"
          />
        )}
      </div>

      <TabBar activeTab="conversations" onChangeTab={(tab) => onChangeView(tab as ChatWidgetViews)} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-r-2 border-vivid-purple"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">{config.messages?.emptyStateMessage || 'No conversations yet'}</p>
            <button
              onClick={onStartChat}
              className="px-4 py-2 rounded bg-vivid-purple hover:bg-vivid-purple-dark text-white transition-colors"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 rounded-md border cursor-pointer transition-colors ${
                conversation.unread
                  ? 'bg-violet-50 border-violet-200'
                  : 'bg-white border-gray-200 hover:border-violet-200'
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{conversation.title || 'Chat'}</h3>
                <span className="text-xs text-gray-500">
                  {conversation.timestamp instanceof Date
                    ? conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  {conversation.agentInfo?.status === 'online' && (
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  )}
                  <span className="text-xs text-gray-500">
                    {conversation.agentInfo?.name || 'Support Agent'}
                  </span>
                </div>
                
                {conversation.unread && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-violet-500 text-white rounded-full">
                    !
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onStartChat}
          className="w-full py-2 rounded bg-vivid-purple hover:bg-vivid-purple-dark text-white transition-colors"
        >
          Start new conversation
        </button>
      </div>
    </div>
  );
};

export default MessagesView;
