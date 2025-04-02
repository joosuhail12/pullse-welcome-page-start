
// This is the script that gets embedded on websites
(() => {
  // Create a script tag to load the widget bundle
  const loadScript = (src: string) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
    return script;
  };

  // Store the initialization config
  const config = {
    workspaceId: WIDGET_SCRIPT.getAttribute('data-workspace-id') || undefined,
    branding: {
      primaryColor: WIDGET_SCRIPT.getAttribute('data-primary-color') || undefined,
      showBrandingBar: WIDGET_SCRIPT.getAttribute('data-show-branding') !== 'false'
    }
  };
  
  // Load the actual widget bundle
  const scriptEl = loadScript('https://cdn.pullse.com/chat-widget.js');
  
  // Initialize the widget once loaded
  scriptEl.onload = () => {
    if (window.ChatWidget) {
      window.ChatWidget.init(config);
    }
  };

  // Store reference to the current script
  var WIDGET_SCRIPT = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

})();
