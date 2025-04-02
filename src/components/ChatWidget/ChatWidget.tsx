
import React, { useState } from 'react';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import { Home, MessageSquare } from 'lucide-react';

type ViewState = 'home' | 'messages' | 'chat';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export const ChatWidget = () => {
  const [viewState, setViewState] = useState<ViewState>('home');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  
  const handleStartChat = (conversation?: Conversation) => {
    if (conversation) {
      setActiveConversation(conversation);
    } else {
      // Create a new conversation
      const newConversation = {
        id: `conv-${Date.now()}`,
        title: 'New Conversation',
        lastMessage: '',
        timestamp: new Date()
      };
      setActiveConversation(newConversation);
    }
    setViewState('chat');
  };

  const handleBackToMessages = () => {
    setViewState('messages');
  };

  const handleChangeView = (view: ViewState) => {
    if (view !== 'chat') {
      setViewState(view);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 rounded-lg shadow-lg overflow-hidden flex flex-col bg-white border border-gray-200 max-h-[600px]">
      <div className="w-full max-h-[600px] flex flex-col">
        {viewState === 'chat' ? (
          <ChatView 
            conversation={activeConversation!} 
            onBack={handleBackToMessages} 
          />
        ) : (
          <div className="flex flex-col h-96">
            <div className="flex-grow overflow-y-auto">
              {viewState === 'home' && <HomeView onStartChat={handleStartChat} />}
              {viewState === 'messages' && <MessagesView onSelectConversation={handleStartChat} />}
            </div>
            
            {/* Tab Bar */}
            <div className="border-t flex justify-around">
              <button 
                onClick={() => handleChangeView('home')} 
                className={`flex flex-col items-center py-3 px-4 flex-1 ${
                  viewState === 'home' 
                    ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
                    : 'text-gray-500'
                }`}
              >
                <Home size={20} />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button 
                onClick={() => handleChangeView('messages')} 
                className={`flex flex-col items-center py-3 px-4 flex-1 ${
                  viewState === 'messages' 
                    ? 'text-vivid-purple border-t-2 border-vivid-purple -mt-px' 
                    : 'text-gray-500'
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-xs mt-1">Messages</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
