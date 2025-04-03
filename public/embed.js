
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
  var eventListeners = {};
  
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
    } else if (command === 'on' && args.length >= 2) {
      // Event handler registration
      var eventType = args[0];
      var callback = args[1];
      
      if (typeof callback === 'function') {
        registerEventHandler(eventType, callback);
      }
    } else if (command === 'off' && args.length >= 1) {
      // Event handler removal
      var eventType = args[0];
      var callback = args.length >= 2 ? args[1] : undefined;
      
      unregisterEventHandler(eventType, callback);
    } else {
      // Queue commands for later execution
      pullseChatQueue.push([command].concat(args));
    }
  };
  
  /**
   * Register event handler
   */
  function registerEventHandler(eventType, callback) {
    // Convert to standard Pullse event naming
    var fullEventType = eventType === 'all' ? 
      'all' : ('pullse:' + eventType);
    
    if (!eventListeners[fullEventType]) {
      eventListeners[fullEventType] = [];
    }
    
    eventListeners[fullEventType].push(callback);
    
    // Set up DOM event listener if widget is already initialized
    if (initialized) {
      var handleEvent = function(event) {
        callback(event.detail);
      };
      
      callback._domHandler = handleEvent;
      
      if (eventType === 'all') {
        // Listen for all pullse: events
        document.addEventListener('pullse:', handleEvent);
      } else {
        // Listen for specific event
        document.addEventListener(fullEventType, handleEvent);
      }
    }
  }
  
  /**
   * Unregister event handler
   */
  function unregisterEventHandler(eventType, callback) {
    // Convert to standard Pullse event naming
    var fullEventType = eventType === 'all' ? 
      'all' : ('pullse:' + eventType);
    
    if (!eventListeners[fullEventType]) {
      return;
    }
    
    if (callback) {
      // Remove specific callback
      var index = eventListeners[fullEventType].indexOf(callback);
      if (index !== -1) {
        var handler = eventListeners[fullEventType][index];
        if (handler._domHandler) {
          if (eventType === 'all') {
            document.removeEventListener('pullse:', handler._domHandler);
          } else {
            document.removeEventListener(fullEventType, handler._domHandler);
          }
        }
        eventListeners[fullEventType].splice(index, 1);
      }
    } else {
      // Remove all callbacks for this event type
      eventListeners[fullEventType].forEach(function(handler) {
        if (handler._domHandler) {
          if (eventType === 'all') {
            document.removeEventListener('pullse:', handler._domHandler);
          } else {
            document.removeEventListener(fullEventType, handler._domHandler);
          }
        }
      });
      eventListeners[fullEventType] = [];
    }
  }
  
  /**
   * Initialize the chat widget
   */
  function initChatWidget(options) {
    // Validate required options
    if (!options.workspaceId) {
      console.error('Pullse Chat Widget: workspaceId is required');
      return;
    }
    
    // Set up event handling
    options.onEvent = function(event) {
      handleWidgetEvent(event);
    };
    
    // Parse positioning options
    var position = options.position || 'bottom-right';
    var offsetX = options.offsetX !== undefined ? options.offsetX : 20;
    var offsetY = options.offsetY !== undefined ? options.offsetY : 20;
    
    // Set default options
    var config = {
      position: {
        placement: position,
        offsetX: offsetX / 16, // Convert px to rem
        offsetY: offsetY / 16  // Convert px to rem
      },
      workspaceId: options.workspaceId,
      welcomeMessage: options.welcomeMessage,
      branding: {
        primaryColor: options.primaryColor,
        logoUrl: options.logoUrl,
        avatarUrl: options.avatarUrl,
        widgetTitle: options.widgetTitle,
        showBrandingBar: !options.hideBranding
      },
      autoOpen: !!options.autoOpen,
      onEvent: options.onEvent,
      eventHandlers: options.eventHandlers || {}
    };
    
    // Create global config object
    w.__PULLSE_CHAT_CONFIG__ = config;
    
    // Create container element
    var containerElement = document.createElement('div');
    containerElement.id = 'pullse-chat-widget-container';
    document.body.appendChild(containerElement);
    
    // Add styles
    var styleElement = document.createElement('style');
    styleElement.textContent = '#pullse-chat-widget-container { position: fixed; z-index: 9999; ' + getPositionStyles(position, offsetX, offsetY) + ' }';
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
      
      // Set up event handlers after load
      setupEventHandlers();
    };
    
    document.body.appendChild(scriptElement);
  }
  
  /**
   * Set up event handlers for the widget
   */
  function setupEventHandlers() {
    // Set up handlers for each event type
    for (var eventType in eventListeners) {
      eventListeners[eventType].forEach(function(callback) {
        var handleEvent = function(event) {
          callback(event.detail);
        };
        
        callback._domHandler = handleEvent;
        
        if (eventType === 'all') {
          // Special case for 'all' events
          document.addEventListener('pullse:', handleEvent);
        } else {
          document.addEventListener(eventType, handleEvent);
        }
      });
    }
  }
  
  /**
   * Handle widget events
   */
  function handleWidgetEvent(event) {
    // Dispatch to registered handlers
    var eventType = 'pullse:' + event.type;
    
    if (eventListeners[eventType]) {
      eventListeners[eventType].forEach(function(callback) {
        try {
          callback(event);
        } catch (e) {
          console.error('Error in event handler:', e);
        }
      });
    }
    
    // Also dispatch to 'all' handlers
    if (eventListeners['all']) {
      eventListeners['all'].forEach(function(callback) {
        try {
          callback(event);
        } catch (e) {
          console.error('Error in event handler:', e);
        }
      });
    }
  }
  
  /**
   * Get CSS styles for widget position
   */
  function getPositionStyles(position, offsetX, offsetY) {
    switch (position) {
      case 'bottom-left':
        return 'bottom: ' + offsetY + 'px; left: ' + offsetX + 'px;';
      case 'top-right':
        return 'top: ' + offsetY + 'px; right: ' + offsetX + 'px;';
      case 'top-left':
        return 'top: ' + offsetY + 'px; left: ' + offsetX + 'px;';
      case 'bottom-right':
      default:
        return 'bottom: ' + offsetY + 'px; right: ' + offsetX + 'px;';
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
      offsetX: currentScript.getAttribute('data-offset-x') ? parseInt(currentScript.getAttribute('data-offset-x'), 10) : undefined,
      offsetY: currentScript.getAttribute('data-offset-y') ? parseInt(currentScript.getAttribute('data-offset-y'), 10) : undefined,
      logoUrl: currentScript.getAttribute('data-logo-url'),
      avatarUrl: currentScript.getAttribute('data-avatar-url'),
      widgetTitle: currentScript.getAttribute('data-widget-title'),
      hideBranding: currentScript.hasAttribute('data-hide-branding'),
      autoOpen: currentScript.hasAttribute('data-auto-open')
    });
  }
})(window, document);
