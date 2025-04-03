
/**
 * Vanilla JavaScript Integration Example for Pullse Chat Widget
 * 
 * This example demonstrates how to integrate the Pullse Chat Widget
 * into a plain JavaScript application.
 */

// Basic installation and initialization
function initPullseChat(config) {
  // Create script element
  const script = document.createElement('script');
  script.src = 'https://cdn.pullse.io/embed.js';
  script.async = true;
  
  // Initialize the widget after script loads
  script.onload = () => {
    if (!window.Pullse) {
      console.error('Failed to load Pullse Chat Widget');
      return;
    }
    
    // Initialize with configuration
    window.Pullse.chat('init', config);
    
    // Optional: Register global event listener
    window.Pullse.chat('on', 'all', function(event) {
      console.log('Pullse event:', event.type, event);
    });
  };
  
  // Add script to page
  document.body.appendChild(script);
}

// Example initialization
document.addEventListener('DOMContentLoaded', () => {
  initPullseChat({
    workspaceId: 'your-workspace-id',
    primaryColor: '#4F46E5',
    position: 'bottom-right',
    offsetY: 20,
    welcomeMessage: 'How can we help you today?'
  });
});

// Example: Advanced usage with API controls

class PullseChatController {
  constructor(config) {
    this.initialized = false;
    this.config = config;
    this.events = {};
    
    this.init();
  }
  
  init() {
    if (this.initialized) return;
    
    // Load script
    const script = document.createElement('script');
    script.src = 'https://cdn.pullse.io/embed.js';
    script.async = true;
    
    script.onload = () => {
      if (!window.Pullse) {
        console.error('Failed to load Pullse Chat Widget');
        return;
      }
      
      // Initialize chat widget
      window.Pullse.chat('init', this.config);
      this.initialized = true;
      
      // Register event handlers
      this.setupEventListeners();
      
      // Trigger ready callback
      if (this.events.ready) {
        this.events.ready();
      }
    };
    
    document.body.appendChild(script);
  }
  
  setupEventListeners() {
    // Register all event handlers
    for (const [eventName, callback] of Object.entries(this.events)) {
      if (eventName === 'ready') continue; // 'ready' is handled separately
      
      window.Pullse.chat('on', eventName, callback);
    }
  }
  
  on(event, callback) {
    this.events[event] = callback;
    
    // If already initialized, register the event immediately
    if (this.initialized && event !== 'ready') {
      window.Pullse.chat('on', event, callback);
    }
    
    return this; // For chaining
  }
  
  open() {
    if (this.initialized) {
      window.Pullse.chat('open');
    }
    return this;
  }
  
  close() {
    if (this.initialized) {
      window.Pullse.chat('close');
    }
    return this;
  }
  
  toggle() {
    if (this.initialized) {
      window.Pullse.chat('toggle');
    }
    return this;
  }
  
  setUser(userData) {
    if (this.initialized) {
      window.Pullse.chat('setUser', userData);
    } else {
      // Store user data for when initialization completes
      this.config.userData = userData;
    }
    return this;
  }
  
  sendMessage(message) {
    if (this.initialized) {
      window.Pullse.chat('sendMessage', message);
    }
    return this;
  }
  
  startConversation(initialMessage) {
    if (this.initialized) {
      window.Pullse.chat('startConversation', initialMessage);
    }
    return this;
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.initialized) {
      window.Pullse.chat('updateConfig', newConfig);
    }
    return this;
  }
}

// Example usage:
/*
const chatWidget = new PullseChatController({
  workspaceId: 'your-workspace-id',
  primaryColor: '#4F46E5',
  position: 'bottom-right'
});

// Register event handlers
chatWidget
  .on('ready', () => console.log('Widget is ready'))
  .on('chat:open', () => console.log('Chat opened'))
  .on('chat:messageSent', (event) => console.log('Message sent:', event.data.message));

// Set user information
chatWidget.setUser({
  name: 'John Doe',
  email: 'john@example.com',
  userId: '12345',
  plan: 'premium'
});

// Add buttons to control the widget
document.getElementById('openChatBtn').addEventListener('click', () => {
  chatWidget.open();
});

document.getElementById('sendMessageBtn').addEventListener('click', () => {
  const message = document.getElementById('messageInput').value;
  chatWidget.sendMessage(message);
});
*/
