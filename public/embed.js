
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
  var widgetScriptLoaded = false;
  var lazyLoadObserver = null;
  var currentVersion = '1.0.0'; // Script version for update checks
  var scriptIntegrityHashes = {
    'chat-widget.js': 'sha384-ZWV5STn1gVLUuKbJx22EsU08tW3tuALY9FEZmOc1mHMVpZnuQYgKMW4M24405lnN',
    'widget-styles.css': 'sha384-H483Zlm4zvw3f83lKp8ymNGmJWDMWR2B3sZY9YF2W9YuNpw3kS9RYPhtAGmOssM6'
  };
  
  // Cache DOM elements
  var containerElement = null;
  
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
    } else if (command === 'checkVersion') {
      // New command to manually check for updates
      checkForUpdates(true);
    } else if (command === 'setTestMode') {
      // New command to enable/disable test mode
      var enabled = args.length >= 1 ? Boolean(args[0]) : true;
      setTestMode(enabled);
    } else {
      // Queue commands for later execution
      pullseChatQueue.push([command].concat(args));
    }
  };

  /**
   * Set test mode for the chat widget
   */
  function setTestMode(enabled) {
    if (enabled) {
      try {
        sessionStorage.setItem('pullse_test_mode', 'enabled');
        console.info('[Pullse] Test mode enabled');
      } catch (e) {
        console.warn('[Pullse] Could not store test mode in sessionStorage');
      }
    } else {
      try {
        sessionStorage.removeItem('pullse_test_mode');
        console.info('[Pullse] Test mode disabled');
      } catch (e) {
        // Ignore errors
      }
    }
    
    // If widget is already loaded, refresh it
    if (widgetScriptLoaded && w.PullseSDK && typeof w.PullseSDK.refreshWidget === 'function') {
      w.PullseSDK.refreshWidget();
    }
  }

  /**
   * Check for script updates from CDN
   * @param {boolean} notifyEvenIfLatest Whether to show notification even if using latest version
   */
  function checkForUpdates(notifyEvenIfLatest) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://cdn.pullse.io/version.json?t=' + new Date().getTime(), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var versionInfo = JSON.parse(xhr.responseText);
            if (versionInfo && versionInfo.version) {
              if (versionInfo.version !== currentVersion) {
                // Show update notification
                console.info('[Pullse] A new version of the chat widget is available: ' + versionInfo.version);
                if (typeof versionInfo.releaseNotes === 'string') {
                  console.info('[Pullse] Release notes: ' + versionInfo.releaseNotes);
                }
                
                var updateEvent = {
                  type: 'versionUpdate',
                  currentVersion: currentVersion,
                  latestVersion: versionInfo.version,
                  releaseNotes: versionInfo.releaseNotes || '',
                  updateUrl: versionInfo.updateUrl || 'https://docs.pullse.io/updates'
                };
                
                dispatchEvent(updateEvent);
              } else if (notifyEvenIfLatest) {
                console.info('[Pullse] You are using the latest version: ' + currentVersion);
              }
            }
          } catch (e) {
            console.error('[Pullse] Error checking for updates:', e);
          }
        } else {
          console.warn('[Pullse] Could not check for updates. Status: ' + xhr.status);
        }
      }
    };
    xhr.send();
  }
  
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
    if (initialized && widgetScriptLoaded) {
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
   * Progressive loading - Create only launcher button first
   */
  function createLauncherButton(options, position, offsetX, offsetY) {
    // Create launcher container
    var launcherContainer = document.createElement('div');
    launcherContainer.id = 'pullse-chat-launcher';
    launcherContainer.style.position = 'fixed';
    launcherContainer.style.zIndex = '9998';
    launcherContainer.style.cursor = 'pointer';
    
    // Apply position
    switch (position) {
      case 'bottom-left':
        launcherContainer.style.bottom = offsetY + 'px';
        launcherContainer.style.left = offsetX + 'px';
        break;
      case 'top-right':
        launcherContainer.style.top = offsetY + 'px';
        launcherContainer.style.right = offsetX + 'px';
        break;
      case 'top-left':
        launcherContainer.style.top = offsetY + 'px';
        launcherContainer.style.left = offsetX + 'px';
        break;
      case 'bottom-right':
      default:
        launcherContainer.style.bottom = offsetY + 'px';
        launcherContainer.style.right = offsetX + 'px';
    }
    
    // Create the button
    var button = document.createElement('div');
    button.className = 'pullse-chat-button';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = options.primaryColor || '#6366f1';
    button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'all 0.2s ease';
    
    // Create the icon
    var svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    button.innerHTML = svgIcon;
    
    // Add test mode indicator if applicable
    if (isTestMode()) {
      var testBadge = document.createElement('div');
      testBadge.style.position = 'absolute';
      testBadge.style.top = '-5px';
      testBadge.style.right = '-5px';
      testBadge.style.backgroundColor = '#f97316'; // Orange color
      testBadge.style.color = 'white';
      testBadge.style.fontSize = '10px';
      testBadge.style.padding = '2px 4px';
      testBadge.style.borderRadius = '10px';
      testBadge.style.fontWeight = 'bold';
      testBadge.textContent = 'TEST';
      button.appendChild(testBadge);
    }
    
    // Add hover effect
    button.onmouseover = function() {
      button.style.transform = 'scale(1.05)';
    };
    button.onmouseout = function() {
      button.style.transform = 'scale(1)';
    };
    
    // Add click handler to load full widget
    button.onclick = function() {
      loadFullWidget(options);
      launcherContainer.style.display = 'none';
    };
    
    launcherContainer.appendChild(button);
    document.body.appendChild(launcherContainer);
    
    return launcherContainer;
  }
  
  /**
   * Check if test mode is enabled
   */
  function isTestMode() {
    try {
      return sessionStorage.getItem('pullse_test_mode') === 'enabled';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Add Subresource Integrity (SRI) to a script or link element
   * @param {HTMLElement} element The DOM element to add integrity to
   * @param {string} resourceName The name of the resource in the scriptIntegrityHashes object
   */
  function addIntegrityAttribute(element, resourceName) {
    if (scriptIntegrityHashes[resourceName]) {
      element.setAttribute('integrity', scriptIntegrityHashes[resourceName]);
      element.setAttribute('crossorigin', 'anonymous');
    }
  }
  
  /**
   * Lazy load the full widget when needed
   */
  function loadFullWidget(config) {
    if (widgetScriptLoaded) {
      return;
    }
    
    // Create container element for the full widget if not already created
    if (!containerElement) {
      containerElement = document.createElement('div');
      containerElement.id = 'pullse-chat-widget-container';
      document.body.appendChild(containerElement);
    }
    
    // Add styles
    if (!document.getElementById('pullse-chat-widget-styles')) {
      var styleElement = document.createElement('style');
      styleElement.id = 'pullse-chat-widget-styles';
      styleElement.textContent = '#pullse-chat-widget-container { position: fixed; z-index: 9999; ' + getPositionStyles(config.position, config.offsetX, config.offsetY) + ' }';
      document.head.appendChild(styleElement);
      
      // Add external stylesheet with SRI if applicable
      var cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.pullse.io/widget-styles.css' + '?v=' + currentVersion;
      addIntegrityAttribute(cssLink, 'widget-styles.css');
      document.head.appendChild(cssLink);
    }
    
    // Check for test mode
    var testMode = isTestMode() || config.testMode;
    
    if (testMode) {
      setTestMode(true);
    }
    
    // Set global config object with version stamp for cache busting
    w.__PULLSE_CHAT_CONFIG__ = {
      ...config,
      version: currentVersion,
      testMode: testMode,
      onEvent: function(event) {
        handleWidgetEvent(event);
      }
    };
    
    // Dynamically load the widget script with cache busting and SRI
    var scriptElement = document.createElement('script');
    var cacheParam = '?v=' + currentVersion;
    scriptElement.src = 'https://cdn.pullse.io/chat-widget.js' + cacheParam;
    scriptElement.async = true;
    
    // Add integrity attribute for security
    addIntegrityAttribute(scriptElement, 'chat-widget.js');
    
    // Add error handling for SRI failures
    scriptElement.onerror = function() {
      console.error('[Pullse] Failed to load chat widget script. This could be due to a network error or a Content Security Policy issue.');
      dispatchEvent({
        type: 'error',
        code: 'script_load_failed',
        message: 'Failed to load chat widget script'
      });
    };
    
    scriptElement.onload = function() {
      console.log('[Pullse] Chat Widget loaded successfully');
      widgetScriptLoaded = true;
      
      // Check for updates after successful load
      setTimeout(function() {
        checkForUpdates(false);
      }, 3000);
      
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
   * Initialize the chat widget with lazy loading
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
    
    // Check for test mode
    if (options.testMode) {
      setTestMode(true);
    }
    
    // Set default options with function references removed (for serialization)
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
      eventHandlers: options.eventHandlers || {},
      testMode: options.testMode || isTestMode() // Include test mode flag
    };
    
    // Check if we should implement lazy loading via scroll
    if (options.lazyLoadScroll) {
      initLazyLoadViaScroll(options, config, position, offsetX, offsetY);
    } 
    // Check if autoOpen is set - if yes, load the full widget immediately
    else if (options.autoOpen) {
      loadFullWidget(config);
    } 
    // Otherwise, start with just the launcher
    else {
      createLauncherButton(options, position, offsetX, offsetY);
    }
  }
  
  /**
   * Initialize lazy loading via scroll with Intersection Observer
   */
  function initLazyLoadViaScroll(options, config, position, offsetX, offsetY) {
    // Create a sentinel element for the observer
    var sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'absolute'; 
    sentinel.style.visibility = 'hidden';
    
    // Position the sentinel near the bottom of the page
    var scrollThreshold = options.scrollThreshold || 0.7; // Default 70% down the page
    sentinel.style.top = (window.innerHeight * scrollThreshold) + 'px';
    
    document.body.appendChild(sentinel);
    
    // Use Intersection Observer to detect when user scrolls to the sentinel
    lazyLoadObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        // User has scrolled to the threshold, load the widget
        loadFullWidget(config);
        
        // Stop observing
        if (lazyLoadObserver) {
          lazyLoadObserver.disconnect();
          lazyLoadObserver = null;
        }
        
        // Remove sentinel
        if (sentinel.parentNode) {
          sentinel.parentNode.removeChild(sentinel);
        }
      }
    }, {
      threshold: 0.1 // Trigger when 10% visible
    });
    
    // Start observing
    lazyLoadObserver.observe(sentinel);
    
    // Add lightweight launcher button for immediate interaction
    createLauncherButton(options, position, offsetX, offsetY);
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
   * Handle widget events with debounce for typing indicators
   */
  var typingTimeout;
  function handleWidgetEvent(event) {
    // Apply debouncing for typing indicators
    if (event.type === 'typing') {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Wait 300ms before dispatching typing events
      typingTimeout = setTimeout(function() {
        dispatchEvent(event);
      }, 300);
      
      return;
    }
    
    // For all other events, dispatch immediately
    dispatchEvent(event);
  }
  
  /**
   * Dispatch event to handlers
   */
  function dispatchEvent(event) {
    // Dispatch to registered handlers
    var eventType = 'pullse:' + event.type;
    
    if (eventListeners[eventType]) {
      eventListeners[eventType].forEach(function(callback) {
        try {
          callback(event);
        } catch (e) {
          console.error('[Pullse] Error in event handler:', e);
        }
      });
    }
    
    // Also dispatch to 'all' handlers
    if (eventListeners['all']) {
      eventListeners['all'].forEach(function(callback) {
        try {
          callback(event);
        } catch (e) {
          console.error('[Pullse] Error in event handler:', e);
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
      autoOpen: currentScript.hasAttribute('data-auto-open'),
      lazyLoadScroll: currentScript.hasAttribute('data-lazy-load'),
      scrollThreshold: currentScript.getAttribute('data-scroll-threshold') ? parseFloat(currentScript.getAttribute('data-scroll-threshold')) : undefined,
      testMode: currentScript.hasAttribute('data-test-mode'), // New test mode data attribute
      checkUpdates: !currentScript.hasAttribute('data-disable-updates')
    });
  }
})(window, document);
