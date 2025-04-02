
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ChatWidget } from './components/ChatWidget/ChatWidget';
import PullseChatWidgetLoader from './components/ChatWidget/embed';

// Initialize the chat widget if config exists
const initChatWidget = () => {
  const config = (window as any).__PULLSE_CHAT_CONFIG__;
  
  if (config && document.getElementById('pullse-chat-widget-container')) {
    const container = document.getElementById('pullse-chat-widget-container');
    const root = createRoot(container!);
    
    root.render(
      <React.StrictMode>
        <ChatWidget 
          workspaceId={config.workspaceId}
        />
      </React.StrictMode>
    );
    
    console.log('Pullse Chat Widget initialized with config:', config);
  }
};

// Check if this is being loaded as the chat widget bundle
if (document.currentScript && 
    (document.currentScript as HTMLScriptElement).src && 
    (document.currentScript as HTMLScriptElement).src.includes('chat-widget.js')) {
  initChatWidget();
} else {
  // Normal app initialization
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Export the widget loader for direct imports
export { PullseChatWidgetLoader as default };
