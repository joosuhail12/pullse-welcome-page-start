
// This is the script that gets embedded on websites
(() => {
  // Store reference to the current script
  const WIDGET_SCRIPT = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Store the initialization config
  const config = {
    workspaceId: WIDGET_SCRIPT.getAttribute('data-workspace-id') || undefined,
    branding: {
      primaryColor: WIDGET_SCRIPT.getAttribute('data-primary-color') || undefined,
      showBrandingBar: WIDGET_SCRIPT.getAttribute('data-show-branding') !== 'false'
    }
  };
  
  // Create global namespace for the widget
  window.ChatWidget = {
    init: () => console.warn('Chat widget is still loading...'),
    open: () => console.warn('Chat widget is still loading...'),
    close: () => console.warn('Chat widget is still loading...'),
    toggle: () => console.warn('Chat widget is still loading...')
  };

  // Only load the widget when needed (on button click or immediately if auto-open is set)
  const shouldLoadImmediately = WIDGET_SCRIPT.getAttribute('data-auto-load') === 'true';
  
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
      bottom: 20px;
      right: 20px;
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
    window.ChatWidget.init = (config) => {
      if (document.body.contains(launcherButton)) {
        document.body.removeChild(launcherButton);
      }
      loadWidgetResources();
    };
  }
})();
