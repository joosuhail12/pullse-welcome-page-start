
import React from 'react';
import ChatWidget from '@/components/ChatWidget/ChatWidget';

const Index = () => {
  // In a real app, this would come from your app's configuration or context
  const workspaceId = "demo-workspace-123";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-purple-50 text-center">
      <div className="max-w-2xl px-6">
        <h1 className="text-5xl font-bold mb-4 text-vivid-purple">
          Welcome to Pullse
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your journey begins here. A powerful platform designed to simplify and enhance your digital experience.
        </p>
        <div className="space-x-4">
          <button className="bg-vivid-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
            Get Started
          </button>
          <button className="bg-soft-purple text-vivid-purple px-6 py-3 rounded-lg border border-vivid-purple hover:bg-soft-purple-100 transition-colors">
            Learn More
          </button>
        </div>
      </div>
      
      <ChatWidget workspaceId={workspaceId} />
    </div>
  );
};

export default Index;
