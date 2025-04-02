
/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

interface PullseChatWidgetOptions {
  workspaceId: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  hideBranding?: boolean;
  autoOpen?: boolean;
}

class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private initialized = false;

  constructor(options: PullseChatWidgetOptions) {
    // Set default options
    this.options = {
      position: 'bottom-right',
      hideBranding: false,
      autoOpen: false,
      ...options
    };

    // Validate required options
    if (!this.options.workspaceId) {
      console.error('Pullse Chat Widget: workspaceId is required');
      return;
    }

    // Initialize the widget
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    if (this.initialized) return;
    this.initialized = true;
    
    console.log('Initializing Pullse Chat Widget with options:', this.options);
    
    // Create container element
    this.containerElement = document.createElement('div');
    this.containerElement.id = 'pullse-chat-widget-container';
    document.body.appendChild(this.containerElement);

    // Add styles
    this.injectStyles();
    
    // Load React and ReactDOM if needed
    this.loadDependencies()
      .then(() => this.loadWidget())
      .catch(error => console.error('Failed to load Pullse Chat Widget dependencies:', error));
  }

  private injectStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      #pullse-chat-widget-container {
        position: fixed;
        z-index: 9999;
        ${this.getPositionStyles()}
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  private getPositionStyles(): string {
    switch (this.options.position) {
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

  private loadDependencies(): Promise<void> {
    return new Promise((resolve) => {
      // Check if React and ReactDOM are already loaded
      if (window.React && window.ReactDOM) {
        resolve();
        return;
      }

      // Load React and ReactDOM from CDN
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
      reactScript.crossOrigin = 'anonymous';
      
      const reactDomScript = document.createElement('script');
      reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
      reactDomScript.crossOrigin = 'anonymous';
      
      // Wait for both to load
      let loaded = 0;
      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) resolve();
      };
      
      reactScript.onload = checkLoaded;
      reactDomScript.onload = checkLoaded;
      
      document.head.appendChild(reactScript);
      document.head.appendChild(reactDomScript);
    });
  }

  private loadWidget(): void {
    // Create global config object
    (window as any).__PULLSE_CHAT_CONFIG__ = {
      workspaceId: this.options.workspaceId,
      welcomeMessage: this.options.welcomeMessage,
      branding: {
        primaryColor: this.options.primaryColor,
        showBrandingBar: !this.options.hideBranding
      },
      autoOpen: this.options.autoOpen
    };
    
    // Load the widget bundle
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = 'https://cdn.pullse.io/chat-widget.js'; // Replace with actual CDN URL
    this.scriptElement.async = true;
    this.scriptElement.onload = () => {
      console.log('Pullse Chat Widget loaded successfully');
    };
    this.scriptElement.onerror = () => {
      console.error('Failed to load Pullse Chat Widget');
    };
    
    document.body.appendChild(this.scriptElement);
  }
}

// Create global Pullse object
(window as any).Pullse = {
  initChatWidget: (options: PullseChatWidgetOptions) => {
    return new PullseChatWidgetLoader(options);
  }
};

// Export for ESM environments
export default PullseChatWidgetLoader;
