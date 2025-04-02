
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';

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
          <Tabs 
            defaultValue="home" 
            value={viewState} 
            onValueChange={(value) => handleChangeView(value as ViewState)}
            className="w-full"
          >
            <div className="border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="home" className="py-3">Home</TabsTrigger>
                <TabsTrigger value="messages" className="py-3">Messages</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-96 overflow-y-auto">
              <TabsContent value="home" className="mt-0">
                <HomeView onStartChat={handleStartChat} />
              </TabsContent>
              
              <TabsContent value="messages" className="mt-0">
                <MessagesView onSelectConversation={handleStartChat} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
