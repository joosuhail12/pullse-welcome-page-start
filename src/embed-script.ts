
import { buildConfigFromScript, mergeConfigs } from './embed/config-builder';
import { createLauncherButton } from './embed/launcher-button';
import { eventHandlers } from './embed/events';
import { loadWidgetResources } from './embed/loader';
import { ChatWidgetInterface, WidgetConfig } from './embed/types';

// This is the script that gets embedded on websites
(() => {
  console.log('Chat widget embed script starting...');
  
  // Store reference to the current script
  const WIDGET_SCRIPT = document.currentScript as HTMLScriptElement || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Build configuration from data attributes
  const config = buildConfigFromScript(WIDGET_SCRIPT);
  
  // Create global namespace for the widget
  window.ChatWidget = {
    init: (customConfig = {}) => {
      // Merge custom config with the one from data attributes
      const mergedConfig = mergeConfigs(config, customConfig);
      
      // Instead of loading resources again, we'll now directly initialize the widget
      // We'll return the merged config for reference
      console.log('Initializing chat widget with config:', mergedConfig);
      return mergedConfig;
    },
    open: () => console.warn('Chat widget is still loading...'),
    close: () => console.warn('Chat widget is still loading...'),
    toggle: () => console.warn('Chat widget is still loading...'),
    
    // Event handling methods
    ...eventHandlers
  } as ChatWidgetInterface;

  // Only load the widget when needed (on button click or immediately if auto-open is set)
  const shouldLoadImmediately = WIDGET_SCRIPT.getAttribute('data-auto-load') === 'true';
  
  const loadWidget = () => {
    console.log('Loading chat widget...');
    
    // Create a clear loading indicator for debugging
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'pullse-chat-widget-loading';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.bottom = '24px';
    loadingIndicator.style.right = '24px';
    loadingIndicator.style.padding = '8px';
    loadingIndicator.style.background = '#f0f0f0';
    loadingIndicator.style.borderRadius = '4px';
    loadingIndicator.style.zIndex = '9999';
    loadingIndicator.textContent = 'Loading chat widget...';
    document.body.appendChild(loadingIndicator);
    
    // Load the actual widget bundle
    const scriptEl = loadWidgetResources();
    
    // Initialize the widget once loaded
    scriptEl.onload = () => {
      console.log('Chat widget resources loaded successfully');
      
      // Remove loading indicator
      if (document.body.contains(loadingIndicator)) {
        document.body.removeChild(loadingIndicator);
      }
      
      try {
        if (window.ChatWidget && window.ChatWidget.init) {
          // Important: Actually open the chat widget after initialization
          const result = window.ChatWidget.init(config);
          console.log('Chat widget initialized successfully', result);
          
          // Force open the chat widget after initialization with a longer timeout
          setTimeout(() => {
            if (window.ChatWidget && window.ChatWidget.open) {
              window.ChatWidget.open();
              console.log('Chat widget opened');
            } else {
              console.error('Failed to open chat widget: open method not available');
            }
          }, 500);
        } else {
          console.error('Chat widget initialization failed - window.ChatWidget or init method not found');
        }
      } catch (error) {
        console.error('Error initializing chat widget:', error);
      }
    };

    scriptEl.onerror = (error) => {
      console.error('Failed to load chat widget resources:', error);
      
      // Remove loading indicator on error
      if (document.body.contains(loadingIndicator)) {
        document.body.removeChild(loadingIndicator);
      }
      
      // Show error to user
      const errorEl = document.createElement('div');
      errorEl.style.position = 'fixed';
      errorEl.style.bottom = '24px';
      errorEl.style.right = '24px';
      errorEl.style.padding = '12px';
      errorEl.style.background = '#f44336';
      errorEl.style.color = 'white';
      errorEl.style.borderRadius = '4px';
      errorEl.style.zIndex = '9999';
      errorEl.textContent = 'Failed to load chat widget.';
      document.body.appendChild(errorEl);
      
      // Remove error after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorEl)) {
          document.body.removeChild(errorEl);
        }
      }, 5000);
    };
  };

  if (shouldLoadImmediately) {
    console.log('Auto-loading chat widget');
    loadWidget();
  } else {
    console.log('Creating launcher button for chat widget');
    // Create a simple launcher button that will load the widget on click
    const launcherButton = createLauncherButton(config, loadWidget);
    
    // Add the launcher to the page
    document.body.appendChild(launcherButton);
    
    // Replace the init function to remove the launcher
    const originalInit = window.ChatWidget.init;
    window.ChatWidget.init = (customConfig = {}) => {
      if (document.body.contains(launcherButton)) {
        document.body.removeChild(launcherButton);
      }
      
      // Merge custom config with the one from data attributes
      const mergedConfig = mergeConfigs(config, customConfig);
      
      return originalInit(mergedConfig);
    };
  }

  // Log that the chat widget script has been successfully loaded
  console.log('Chat widget embed script loaded successfully');
})();
