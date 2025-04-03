import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PullseChatWidgetLoader from './components/ChatWidget/embed';
import { initializeEmbedSecurity } from './components/ChatWidget/utils/embedSecurity';
import { errorHandler } from '@/lib/error-handler';
import { isTestMode, setTestMode } from './components/ChatWidget/utils/testMode';

const PullseNamespace = {
  ChatWidget: React.lazy(() => import('./components/ChatWidget/ChatWidget')),
  
  initChatWidget: () => {
    try {
      const config = (window as any).__PULLSE_CHAT_CONFIG__;
      
      if (config && document.getElementById('pullse-chat-widget-container')) {
        if (config.testMode) {
          setTestMode(true);
          console.info('[Pullse] Running in test mode');
        }
        
        const { container, shadowRoot } = initializeEmbedSecurity('pullse-chat-widget-container');
        
        const innerContainer = shadowRoot instanceof ShadowRoot ? 
          shadowRoot.querySelector('.pullse-chat-widget-inner') : 
          container;
          
        if (!innerContainer) {
          console.error('Failed to find inner container for chat widget');
          return;
        }
        
        const root = createRoot(innerContainer as HTMLElement);
        
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
  
  refreshWidget: () => {
    try {
      const container = document.getElementById('pullse-chat-widget-container');
      if (container) {
        PullseNamespace.initChatWidget();
        console.info('[Pullse] Widget refreshed');
      }
    } catch (error) {
      errorHandler.handle(error instanceof Error ? error : new Error('Failed to refresh widget'));
    }
  },
  
  setTestMode: (enabled: boolean) => {
    setTestMode(enabled);
    
    PullseNamespace.refreshWidget();
  },
  
  isTestMode: () => {
    return isTestMode();
  },
  
  version: '1.0.0',
  
  handleError: (error: unknown, componentName?: string) => {
    errorHandler.handle(error instanceof Error ? error : new Error(`Error in ${componentName || 'chat widget'}`));
  }
};

if (document.currentScript && 
    (document.currentScript as HTMLScriptElement).src && 
    (document.currentScript as HTMLScriptElement).src.includes('chat-widget.js')) {
  PullseNamespace.initChatWidget();
} else {
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

export { PullseChatWidgetLoader as default };

(window as any).PullseSDK = PullseNamespace;
