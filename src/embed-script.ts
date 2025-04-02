
// This is the script that gets embedded on websites
(() => {
  // Store reference to the current script
  const WIDGET_SCRIPT = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Helper function to get data-attribute with fallback
  const getDataAttribute = (name, fallback) => {
    const attr = WIDGET_SCRIPT.getAttribute(`data-${name}`);
    return attr !== null ? attr : fallback;
  };

  // Store the initialization config
  const config = {
    workspaceId: getDataAttribute('workspace-id', undefined),
    branding: {
      primaryColor: getDataAttribute('primary-color', undefined),
      showBrandingBar: getDataAttribute('show-branding', 'true') !== 'false',
      
      // Enhanced styling options
      borderRadius: getDataAttribute('border-radius', undefined),
      buttonStyle: getDataAttribute('button-style', undefined),
      messageStyle: getDataAttribute('message-style', undefined),
      theme: getDataAttribute('theme', undefined),
      fontFamily: getDataAttribute('font-family', undefined),
      
      // Advanced color customization
      widgetHeader: {
        backgroundColor: getDataAttribute('header-bg-color', undefined),
        textColor: getDataAttribute('header-text-color', undefined),
      },
      userBubble: {
        backgroundColor: getDataAttribute('user-bubble-color', undefined),
        textColor: getDataAttribute('user-text-color', undefined),
      },
      systemBubble: {
        backgroundColor: getDataAttribute('system-bubble-color', undefined),
        textColor: getDataAttribute('system-text-color', undefined),
      },
      inputBox: {
        backgroundColor: getDataAttribute('input-bg-color', undefined),
        textColor: getDataAttribute('input-text-color', undefined),
        borderColor: getDataAttribute('input-border-color', undefined),
      }
    },
    // Position configuration
    position: getDataAttribute('position', 'bottom-right'),
    
    // Feature flags
    features: {
      fileUpload: getDataAttribute('file-upload', 'true') !== 'false',
      messageRating: getDataAttribute('message-rating', 'false') === 'true',
      readReceipts: getDataAttribute('read-receipts', 'true') !== 'false',
      typingIndicators: getDataAttribute('typing-indicators', 'true') !== 'false'
    }
  };
  
  // Create global namespace for the widget
  window.ChatWidget = {
    init: (customConfig = {}) => {
      // Merge custom config with the one from data attributes
      const mergedConfig = {
        ...config,
        ...customConfig,
        branding: {
          ...config.branding,
          ...(customConfig.branding || {}),
          widgetHeader: {
            ...config.branding.widgetHeader,
            ...(customConfig.branding?.widgetHeader || {})
          },
          userBubble: {
            ...config.branding.userBubble,
            ...(customConfig.branding?.userBubble || {})
          },
          systemBubble: {
            ...config.branding.systemBubble,
            ...(customConfig.branding?.systemBubble || {})
          },
          inputBox: {
            ...config.branding.inputBox,
            ...(customConfig.branding?.inputBox || {})
          }
        },
        features: {
          ...config.features,
          ...(customConfig.features || {})
        }
      };
      
      loadWidgetResources();
      return mergedConfig;
    },
    open: () => console.warn('Chat widget is still loading...'),
    close: () => console.warn('Chat widget is still loading...'),
    toggle: () => console.warn('Chat widget is still loading...'),
    
    // Event handling
    on: (eventName, callback) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      
      const handler = (event) => {
        callback(event.detail);
      };
      
      window.addEventListener(fullEventName, handler);
      
      // Return unsubscribe function
      return () => window.removeEventListener(fullEventName, handler);
    },
    off: (eventName, handler) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      window.removeEventListener(fullEventName, handler);
    }
  };

  // Only load the widget when needed (on button click or immediately if auto-open is set)
  const shouldLoadImmediately = getDataAttribute('auto-load', 'false') === 'true';
  
  const loadWidgetResources = () => {
    // Create a script tag to load the widget bundle
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
      return script;
    };
    
    // Load the actual widget bundle
    const scriptEl = loadScript('https://cdn.pullse.com/chat-widget.js');
    
    // Initialize the widget once loaded
    scriptEl.onload = () => {
      if (window.ChatWidget && window.ChatWidget.init) {
        window.ChatWidget.init(config);
      }
    };
  };

  if (shouldLoadImmediately) {
    loadWidgetResources();
  } else {
    // Create a simple launcher button that will load the widget on click
    const launcherButton = document.createElement('button');
    launcherButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    launcherButton.className = 'chat-widget-launcher';
    
    // Fix: Use setAttribute for style instead of direct assignment
    const buttonStyle = `
      position: fixed;
      ${config.position === 'bottom-left' || config.position === 'top-left' ? 'left: 20px;' : 'right: 20px;'}
      ${config.position === 'top-left' || config.position === 'top-right' ? 'top: 20px;' : 'bottom: 20px;'}
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${config.branding.primaryColor || '#6366f1'};
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    `;
    launcherButton.setAttribute('style', buttonStyle);
    
    // Add hover effect
    launcherButton.addEventListener('mouseover', () => {
      launcherButton.setAttribute('style', buttonStyle + 'transform: scale(1.05);');
    });
    
    launcherButton.addEventListener('mouseout', () => {
      launcherButton.setAttribute('style', buttonStyle);
    });
    
    // Add click handler to load the widget
    launcherButton.addEventListener('click', () => {
      loadWidgetResources();
      document.body.removeChild(launcherButton);
    });
    
    // Add the launcher to the page
    document.body.appendChild(launcherButton);
    
    // Replace the init function to remove the launcher
    window.ChatWidget.init = (customConfig = {}) => {
      if (document.body.contains(launcherButton)) {
        document.body.removeChild(launcherButton);
      }
      
      // Merge custom config with the one from data attributes
      const mergedConfig = {
        ...config,
        ...customConfig,
        branding: {
          ...config.branding,
          ...(customConfig.branding || {}),
          widgetHeader: {
            ...config.branding.widgetHeader,
            ...(customConfig.branding?.widgetHeader || {})
          },
          userBubble: {
            ...config.branding.userBubble,
            ...(customConfig.branding?.userBubble || {})
          },
          systemBubble: {
            ...config.branding.systemBubble,
            ...(customConfig.branding?.systemBubble || {})
          },
          inputBox: {
            ...config.branding.inputBox,
            ...(customConfig.branding?.inputBox || {})
          }
        },
        features: {
          ...config.features,
          ...(customConfig.features || {})
        }
      };
      
      loadWidgetResources();
      return mergedConfig;
    };
  }
})();
