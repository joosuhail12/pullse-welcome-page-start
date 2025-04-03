import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PullseChatWidgetLoader from './components/ChatWidget/embed';
import { initializeEmbedSecurity } from './components/ChatWidget/utils/embedSecurity';

// Create PullseNamespace to contain all global functions and variables
const PullseNamespace = {
  // Lazy-load the ChatWidget component only when needed
  ChatWidget: React.lazy(() => import('./components/ChatWidget/ChatWidget')),
  
  // Initialize the chat widget if config exists
  initChatWidget: () => {
    const config = (window as any).__PULLSE_CHAT_CONFIG__;
    
    if (config && document.getElementById('pullse-chat-widget-container')) {
      // Initialize with enhanced security features
      const { container, shadowRoot } = initializeEmbedSecurity('pullse-chat-widget-container');
      
      // Find the inner container in the shadow DOM
      const innerContainer = shadowRoot instanceof ShadowRoot ? 
        shadowRoot.querySelector('.pullse-chat-widget-inner') : 
        container;
        
      if (!innerContainer) {
        console.error('Failed to find inner container for chat widget');
        return;
      }
      
      // Create a root in the shadow DOM for isolation
      const root = createRoot(innerContainer as HTMLElement);
      
      // Use Suspense to handle the loading state
      root.render(
        <React.Suspense fallback={<div className="loading-widget">Loading...</div>}>
          <PullseNamespace.ChatWidget 
            workspaceId={config.workspaceId}
          />
        </React.Suspense>
      );
      
      console.log('Pullse Chat Widget initialized with config:', config);
    }
  },
  
  // Other namespace functions can be added here
  version: '1.0.0'
};

// Check if this is being loaded as the chat widget bundle
if (document.currentScript && 
    (document.currentScript as HTMLScriptElement).src && 
    (document.currentScript as HTMLScriptElement).src.includes('chat-widget.js')) {
  PullseNamespace.initChatWidget();
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

// Add the PullseNamespace to window for global access, but avoid polluting global scope
(window as any).PullseSDK = PullseNamespace;
