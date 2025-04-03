
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PullseChatWidgetLoader from './components/ChatWidget/embed';

// Lazy-load the ChatWidget component only when needed
const ChatWidget = React.lazy(() => import('./components/ChatWidget/ChatWidget'));

// Initialize the chat widget if config exists
const initChatWidget = () => {
  const config = (window as any).__PULLSE_CHAT_CONFIG__;
  
  if (config && document.getElementById('pullse-chat-widget-container')) {
    const container = document.getElementById('pullse-chat-widget-container');
    const root = createRoot(container!);
    
    // Use Suspense to handle the loading state
    root.render(
      <React.Suspense fallback={<div className="loading-widget">Loading...</div>}>
        <ChatWidget 
          workspaceId={config.workspaceId}
        />
      </React.Suspense>
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
    <App />
  );
}

// Export the widget loader for direct imports
export { PullseChatWidgetLoader as default };
