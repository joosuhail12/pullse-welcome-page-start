
import React from 'react';
import { ChatWidgetConfig } from '../config';
import { Button } from '@/components/ui/button';
import { MessageSquareIcon } from 'lucide-react';

interface HomeViewProps {
  onStartChat: () => void;
  config: ChatWidgetConfig;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  onStartChat, 
  config
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-between p-6">
      {/* Header with logo if available */}
      <div className="text-center mb-6 w-full">
        {config?.branding?.logoUrl ? (
          <img 
            src={config.branding.logoUrl} 
            alt="Company Logo" 
            className="max-h-16 mx-auto"
          />
        ) : (
          <h2 className="text-xl font-semibold mb-2">
            {config?.branding?.widgetTitle || 'Welcome'}
          </h2>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-sm text-center">
        <div className="bg-violet-100 p-4 rounded-full mb-5">
          <MessageSquareIcon className="h-8 w-8 text-violet-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          {config?.branding?.widgetTitle || 'Chat with us'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {config?.welcomeMessage || 'We\'re here to help! Start a conversation and get the support you need.'}
        </p>
        
        <Button 
          size="lg"
          onClick={onStartChat}
          className="px-8"
          style={{ backgroundColor: config?.branding?.primaryColor || '#8B5CF6' }}
        >
          Start a conversation
        </Button>
      </div>
      
      {/* Footer */}
      {config?.branding?.showBrandingBar !== false && (
        <div className="w-full text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-medium">Pullse</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
