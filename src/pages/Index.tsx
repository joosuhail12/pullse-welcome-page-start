import React from 'react';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import { Link } from 'react-router-dom';

const Index = () => {
  const workspaceId = "demo-workspace-123";
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Pullse Chat Widget</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link to="/widget-preview" className="block">
          <div className="border border-gray-200 hover:border-purple-400 p-6 rounded-lg transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2">Widget Preview</h2>
            <p className="text-gray-600">
              Test and customize your chat widget in real-time before deploying it to your website.
            </p>
          </div>
        </Link>
        
        <a href="/embed-demo.html" target="_blank" className="block">
          <div className="border border-gray-200 hover:border-purple-400 p-6 rounded-lg transition-all hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2">Embed Demo</h2>
            <p className="text-gray-600">
              See how to embed the chat widget on your website with custom configuration.
            </p>
          </div>
        </a>
      </div>
      
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
