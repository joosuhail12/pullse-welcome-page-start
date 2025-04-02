
/**
 * Pullse Chat Widget Embed Script
 * Version 1.0.0
 * 
 * This is a lightweight script that can be added to any website to load
 * the Pullse chat widget with custom configuration.
 */
(function(window, document) {
  'use strict';
  
  // Store reference to the global object
  var w = window;
  var pullseChatQueue = [];
  var initialized = false;
  
  // Create global Pullse object if it doesn't exist
  if (!w.Pullse) {
    w.Pullse = {};
  }
  
  /**
   * Main function to handle commands
   */
  w.Pullse.chat = function() {
    var args = Array.prototype.slice.call(arguments);
    var command = args.shift();
    
    if (command === 'init' && !initialized) {
      initialized = true;
      initChatWidget(args[0] || {});
    } else {
      // Queue commands for later execution
      pullseChatQueue.push([command].concat(args));
    }
  };
  
  /**
   * Initialize the chat widget
   */
  function initChatWidget(options) {
    // Validate required options
    if (!options.workspaceId) {
      console.error('Pullse Chat Widget: workspaceId is required');
      return;
    }
    
    // Set default options
    var config = {
      position: options.position || 'bottom-right',
      hideBranding: !!options.hideBranding,
      autoOpen: !!options.autoOpen,
      workspaceId: options.workspaceId,
      welcomeMessage: options.welcomeMessage,
      branding: {
        primaryColor: options.primaryColor,
        showBrandingBar: !options.hideBranding
      }
    };
    
    // Create global config object
    w.__PULLSE_CHAT_CONFIG__ = config;
    
    // Create container element
    var containerElement = document.createElement('div');
    containerElement.id = 'pullse-chat-widget-container';
    document.body.appendChild(containerElement);
    
    // Add styles
    var styleElement = document.createElement('style');
    styleElement.textContent = '#pullse-chat-widget-container { position: fixed; z-index: 9999; ' + getPositionStyles(config.position) + ' }';
    document.head.appendChild(styleElement);
    
    // Load widget script
    var scriptElement = document.createElement('script');
    scriptElement.src = 'https://cdn.pullse.io/chat-widget.js'; // Replace with actual CDN URL
    scriptElement.async = true;
    scriptElement.onload = function() {
      console.log('Pullse Chat Widget loaded successfully');
      
      // Process queued commands
      while (pullseChatQueue.length > 0) {
        var command = pullseChatQueue.shift();
        if (w.Pullse.chatAPI && typeof w.Pullse.chatAPI[command[0]] === 'function') {
          w.Pullse.chatAPI[command[0]].apply(null, command.slice(1));
        }
      }
    };
    
    document.body.appendChild(scriptElement);
  }
  
  /**
   * Get CSS styles for widget position
   */
  function getPositionStyles(position) {
    switch (position) {
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;';
      case 'top-right':
        return 'top: 20px; right: 20px;';
      case 'top-left':
        return 'top: 20px; left: 20px;';
      case 'bottom-right':
      default:
        return 'bottom: 20px; right: 20px;';
    }
  }
  
  // Auto-initialize if the script has data attributes
  var scriptTags = document.getElementsByTagName('script');
  var currentScript = scriptTags[scriptTags.length - 1];
  
  if (currentScript.hasAttribute('data-workspace-id')) {
    w.Pullse.chat('init', {
      workspaceId: currentScript.getAttribute('data-workspace-id'),
      welcomeMessage: currentScript.getAttribute('data-welcome-message'),
      primaryColor: currentScript.getAttribute('data-primary-color'),
      position: currentScript.getAttribute('data-position'),
      hideBranding: currentScript.hasAttribute('data-hide-branding'),
      autoOpen: currentScript.hasAttribute('data-auto-open')
    });
  }
})(window, document);
