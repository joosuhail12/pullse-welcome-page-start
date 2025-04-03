
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PullseChatWidgetLoader from './components/ChatWidget/embed';
import { initializeEmbedSecurity } from './components/ChatWidget/utils/embedSecurity';
import { errorHandler } from '@/lib/error-handler';
import { isTestMode, setTestMode } from './components/ChatWidget/utils/testMode';

// Create PullseNamespace to contain all global functions and variables
const PullseNamespace = {
  // Lazy-load the ChatWidget component only when needed
  ChatWidget: React.lazy(() => import('./components/ChatWidget/ChatWidget')),
  
  // Initialize the chat widget if config exists
  initChatWidget: () => {
    try {
      const config = (window as any).__PULLSE_CHAT_CONFIG__;
      
      if (config && document.getElementById('pullse-chat-widget-container')) {
        // Check for test mode in config
        if (config.testMode) {
          setTestMode(true);
          console.info('[Pullse] Running in test mode');
        }
        
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
          <React.Suspense fallback={
            <div className="loading-widget">
              <div className="w-10 h-10 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin m-auto"></div>
            </div>
          }>
            <PullseNamespace.ChatWidget 
              workspaceId={config.workspaceId}
            />
          </React.Suspense>
        );
        
        console.log('Pullse Chat Widget initialized with config:', config);
      }
    } catch (error) {
      errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize chat widget'));
      
      // Attempt to render a minimal error state
      const container = document.getElementById('pullse-chat-widget-container');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #e11d48;">
            <div style="margin-bottom: 10px;">⚠️</div>
            <div>Failed to initialize chat widget</div>
          </div>
        `;
      }
    }
  },
  
  // Refresh the widget (useful for applying test mode changes)
  refreshWidget: () => {
    try {
      const container = document.getElementById('pullse-chat-widget-container');
      if (container) {
        // Re-initialize the widget
        PullseNamespace.initChatWidget();
        console.info('[Pullse] Widget refreshed');
      }
    } catch (error) {
      errorHandler.handle(error instanceof Error ? error : new Error('Failed to refresh widget'));
    }
  },
  
  // Toggle test mode
  setTestMode: (enabled: boolean) => {
    setTestMode(enabled);
    
    // Refresh the widget to apply test mode changes
    PullseNamespace.refreshWidget();
  },
  
  // Get test mode status
  isTestMode: () => {
    return isTestMode();
  },
  
  // Other namespace functions can be added here
  version: '1.0.0',
  
  // Error handling
  handleError: (error: unknown, componentName?: string) => {
    errorHandler.handle(error instanceof Error ? error : new Error(`Error in ${componentName || 'chat widget'}`));
  }
};

// Check if this is being loaded as the chat widget bundle
if (document.currentScript && 
    (document.currentScript as HTMLScriptElement).src && 
    (document.currentScript as HTMLScriptElement).src.includes('chat-widget.js')) {
  PullseNamespace.initChatWidget();
} else {
  // Normal app initialization
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('Failed to find the root element');

    createRoot(rootElement).render(
      <App />
    );
  } catch (error) {
    errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize application'));
  }
}

// Export the widget loader for direct imports
export { PullseChatWidgetLoader as default };

// Add the PullseNamespace to window for global access, but avoid polluting global scope
(window as any).PullseSDK = PullseNamespace;
