
import React, { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { ConnectionStatus } from '../utils/reconnectionManager';
import TabBar from '../components/TabBar';
import { Button } from '@/components/ui/button';
import { MessageSquareIcon, User2Icon } from 'lucide-react';
import ConnectionStatusIndicator from '../components/ConnectionStatusIndicator';

interface MessagesViewProps {
  onSelect: (conversation: Conversation) => void;
  onViewChange?: (view: string) => void;
  onStartChat: () => void;
  config: ChatWidgetConfig;
  connectionStatus?: ConnectionStatus;
}

const MessagesView = ({
  onSelect,
  onViewChange,
  onStartChat,
  config,
  connectionStatus = ConnectionStatus.CONNECTED
}: MessagesViewProps) => {
  const [activeTab, setActiveTab] = useState<string>('recent');
  const [mockConversations, setMockConversations] = useState<Conversation[]>([]);

  // Generate mock conversations for demo
  useEffect(() => {
    const conversations: Conversation[] = [
      {
        id: 'conv-1',
        title: 'Support Conversation',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        lastMessage: 'Thank you for your help!',
        status: 'active',
        agentInfo: {
          name: 'Sara Willis',
          avatar: 'https://i.pravatar.cc/150?img=44',
          status: 'online'
        }
      },
      {
        id: 'conv-2',
        title: 'Sales Inquiry',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        lastMessage: 'Can you tell me more about pricing?',
        status: 'active',
        agentInfo: {
          name: 'John Smith',
          avatar: 'https://i.pravatar.cc/150?img=52',
          status: 'away'
        }
      }
    ];

    setMockConversations(conversations);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const tabs = [
    { id: 'recent', label: 'Recent' },
    { id: 'active', label: 'Active' },
    { id: 'closed', label: 'Closed' }
  ];

  const hasNoConversations = mockConversations.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none py-3 px-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Messages</h2>
        
        {/* Display connection status if not connected */}
        {connectionStatus !== ConnectionStatus.CONNECTED && (
          <ConnectionStatusIndicator status={connectionStatus} variant="compact" />
        )}
      </div>
      
      <TabBar
        tabs={tabs}
        selectedTab={activeTab}
        onChange={handleTabChange}
      />
      
      {hasNoConversations ? (
        // Empty state
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-gray-100 p-3 rounded-full mb-3">
            <MessageSquareIcon className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No conversations yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start a new conversation to get help.
          </p>
          <Button onClick={onStartChat}>Start a conversation</Button>
        </div>
      ) : (
        // List of conversations
        <div className="flex-grow overflow-y-auto">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => onSelect(conversation)}
            >
              <div className="relative">
                {conversation.agentInfo?.avatar ? (
                  <img
                    src={conversation.agentInfo.avatar}
                    alt={conversation.agentInfo.name || 'Agent'}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="rounded-full bg-purple-100 w-10 h-10 flex items-center justify-center">
                    <User2Icon className="h-5 w-5 text-purple-500" />
                  </div>
                )}
                
                {conversation.agentInfo?.status && (
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white
                    ${conversation.agentInfo.status === 'online' ? 'bg-green-500' : 
                      conversation.agentInfo.status === 'away' ? 'bg-amber-400' : 'bg-gray-300'}`}
                  />
                )}
              </div>
              <div className="flex-grow ml-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">
                    {conversation.agentInfo?.name || conversation.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-500 text-sm truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesView;
