
import { createRoot } from 'react-dom/client';
import React from 'react';
import { dispatchWidgetEvent } from './event-dispatcher';

/**
 * Creates a container element for the widget if it doesn't exist
 */
export function createWidgetContainer(): HTMLElement {
  let containerEl = document.getElementById('pullse-chat-widget-container');
  
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'pullse-chat-widget-container';
    document.body.appendChild(containerEl);
    console.log('Created chat widget container element');
  }
  
  return containerEl;
}

/**
 * Renders a loading placeholder while the widget is loading
 */
export function renderLoadingPlaceholder(containerEl: HTMLElement, primaryColor: string): void {
  const placeholderRoot = createRoot(containerEl);
  placeholderRoot.render(
    React.createElement('div', {
      className: 'chat-widget-loading',
      style: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: primaryColor || '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999
      }
    }, React.createElement('div', {
      style: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        animation: 'chat-widget-spin 1s linear infinite'
      }
    }))
  );
  
  // Add the loading animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes chat-widget-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Renders the actual widget
 */
export async function renderWidget(containerEl: HTMLElement, config: any): Promise<void> {
  try {
    // Dynamically import components
    const [{ ChatWidgetProvider }, { default: ChatWidget }] = await Promise.all([
      import('../components/ChatWidget/ChatWidgetProvider'),
      import('../components/ChatWidget/ChatWidget')
    ]);
    
    console.log('Chat widget components loaded successfully');
    
    const root = createRoot(containerEl);
    root.render(
      React.createElement(
        ChatWidgetProvider, 
        { 
          config, 
          children: React.createElement(ChatWidget, { workspaceId: config.workspaceId })
        }
      )
    );
    
    console.log('Chat widget rendered successfully');
    
    // Try to open the widget with multiple attempts
    attemptOpenWidget();
    
  } catch (err) {
    console.error('Failed to render chat widget:', err);
    renderErrorFallback(containerEl);
  }
}

/**
 * Renders a fallback message if the widget fails to load
 */
export function renderErrorFallback(containerEl: HTMLElement): void {
  const root = createRoot(containerEl);
  root.render(
    React.createElement('div', {
      style: { 
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999
      }
    }, React.createElement('p', null, 'Failed to load chat widget. Please try again later.'))
  );
}

/**
 * Makes multiple attempts to open the widget
 */
export function attemptOpenWidget(): void {
  // First attempt after 100ms
  setTimeout(() => {
    console.log('First attempt to open widget');
    if (window.ChatWidget && window.ChatWidget.open) {
      window.ChatWidget.open();
    }
  }, 100);
  
  // Second attempt after 500ms using event
  setTimeout(() => {
    console.log('Second attempt to open widget');
    dispatchWidgetEvent('open');
  }, 500);
  
  // Third attempt after 1.5s as failsafe
  setTimeout(() => {
    console.log('Third attempt to open widget');
    if (window.ChatWidget && window.ChatWidget.open) {
      window.ChatWidget.open();
      console.log('Chat widget opened via API failsafe');
    }
  }, 1500);
}
