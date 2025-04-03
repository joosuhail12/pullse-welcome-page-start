
/**
 * Vue Integration Example for Pullse Chat Widget
 * 
 * This example demonstrates how to integrate the Pullse Chat Widget
 * into a Vue application.
 */

// PullseChat.vue
export default {
  name: 'PullseChat',
  
  props: {
    workspaceId: {
      type: String,
      required: true
    },
    primaryColor: String,
    position: {
      type: String,
      default: 'bottom-right',
      validator: (value) => {
        return ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(value);
      }
    },
    offsetX: Number,
    offsetY: Number,
    welcomeMessage: String,
    autoOpen: Boolean,
    hideBranding: Boolean,
    userData: Object
  },
  
  data() {
    return {
      initialized: false
    };
  },
  
  mounted() {
    this.loadPullseChat();
  },
  
  methods: {
    loadPullseChat() {
      // Create script element and load the widget
      const script = document.createElement('script');
      script.src = 'https://cdn.pullse.io/embed.js';
      script.async = true;
      
      script.onload = () => {
        if (!window.Pullse) {
          console.error('Failed to load Pullse Chat Widget');
          return;
        }
        
        // Initialize the widget
        window.Pullse.chat('init', {
          workspaceId: this.workspaceId,
          primaryColor: this.primaryColor,
          position: this.position,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          welcomeMessage: this.welcomeMessage,
          autoOpen: this.autoOpen,
          hideBranding: this.hideBranding
        });
        
        // Set user data if provided
        if (this.userData) {
          window.Pullse.chat('setUser', this.userData);
        }
        
        // Register event handlers
        window.Pullse.chat('on', 'ready', this.handleReady);
        window.Pullse.chat('on', 'chat:messageSent', this.handleMessageSent);
        window.Pullse.chat('on', 'chat:messageReceived', this.handleMessageReceived);
        window.Pullse.chat('on', 'chat:open', this.handleOpen);
        window.Pullse.chat('on', 'chat:close', this.handleClose);
        
        this.initialized = true;
      };
      
      document.body.appendChild(script);
    },
    
    handleReady(event) {
      this.$emit('ready', event);
    },
    
    handleMessageSent(event) {
      this.$emit('message-sent', event);
    },
    
    handleMessageReceived(event) {
      this.$emit('message-received', event);
    },
    
    handleOpen(event) {
      this.$emit('open', event);
    },
    
    handleClose(event) {
      this.$emit('close', event);
    }
  },
  
  watch: {
    userData: {
      handler(newUserData) {
        if (this.initialized && window.Pullse) {
          window.Pullse.chat('setUser', newUserData);
        }
      },
      deep: true
    }
  },
  
  beforeDestroy() {
    // Clean up event handlers
    if (window.Pullse && this.initialized) {
      window.Pullse.chat('off', 'ready', this.handleReady);
      window.Pullse.chat('off', 'chat:messageSent', this.handleMessageSent);
      window.Pullse.chat('off', 'chat:messageReceived', this.handleMessageReceived);
      window.Pullse.chat('off', 'chat:open', this.handleOpen);
      window.Pullse.chat('off', 'chat:close', this.handleClose);
    }
  },
  
  // This component doesn't render anything
  render() {
    return null;
  }
};

/**
 * Usage Example:
 * 
 * <template>
 *   <div>
 *     <h1>My Vue App</h1>
 *     <PullseChat
 *       workspaceId="your-workspace-id"
 *       primaryColor="#4F46E5"
 *       :autoOpen="false"
 *       :userData="{ name: 'Jane Doe', email: 'jane@example.com' }"
 *       @message-sent="handleSentMessage"
 *     />
 *   </div>
 * </template>
 * 
 * <script>
 * import PullseChat from './components/PullseChat.vue';
 * 
 * export default {
 *   components: {
 *     PullseChat
 *   },
 *   methods: {
 *     handleSentMessage(event) {
 *       console.log('Message sent:', event);
 *     }
 *   }
 * };
 * </script>
 */
