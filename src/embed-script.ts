
import { buildConfigFromScript, mergeConfigs } from './embed/config-builder';
import { createLauncherButton } from './embed/launcher-button';
import { eventHandlers } from './embed/events';
import { loadWidgetResources } from './embed/loader';
import { ChatWidgetInterface, WidgetConfig } from './embed/types';

// This is the script that gets embedded on websites
(() => {
  // Store reference to the current script
  const WIDGET_SCRIPT = document.currentScript || (function() {
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
      
      loadWidgetResources();
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
    // Load the actual widget bundle
    const scriptEl = loadWidgetResources();
    
    // Initialize the widget once loaded
    scriptEl.onload = () => {
      if (window.ChatWidget && window.ChatWidget.init) {
        window.ChatWidget.init(config);
      }
    };
  };

  if (shouldLoadImmediately) {
    loadWidget();
  } else {
    // Create a simple launcher button that will load the widget on click
    const launcherButton = createLauncherButton(config, loadWidget);
    
    // Add the launcher to the page
    document.body.appendChild(launcherButton);
    
    // Replace the init function to remove the launcher
    window.ChatWidget.init = (customConfig = {}) => {
      if (document.body.contains(launcherButton)) {
        document.body.removeChild(launcherButton);
      }
      
      // Merge custom config with the one from data attributes
      const mergedConfig = mergeConfigs(config, customConfig);
      
      loadWidget();
      return mergedConfig;
    };
  }
})();
