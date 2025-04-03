
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChatWidgetConfig } from '../config';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
  testMode?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  onStartChat, 
  config,
  testMode = false 
}) => {
  const welcomeMessage = config?.welcomeMessage || 'Welcome to our chat! How can we help you today?';
  
  const handleStartChat = () => {
    onStartChat();
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      {testMode && (
        <div className="mb-4 p-2 bg-orange-100 border border-orange-200 rounded-md">
          <p className="text-orange-800 text-xs">
            <strong>Test Mode:</strong> This chat is in test mode. No real messages will be sent to agents.
          </p>
        </div>
      )}
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          {config?.branding?.logoUrl && (
            <img 
              src={config.branding.logoUrl} 
              alt="Company logo" 
              className="w-16 h-16 mb-4 mx-auto object-contain"
            />
          )}
          <h2 className="text-2xl font-semibold mb-2">{config?.branding?.widgetTitle || 'Support Chat'}</h2>
          <p className="text-gray-600 text-sm">{welcomeMessage}</p>
        </div>
        <Button 
          className="px-8 py-2" 
          onClick={handleStartChat}
        >
          Start Chat
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
