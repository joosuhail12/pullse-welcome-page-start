
import { PullseChatWidgetOptions } from './types';
import { getPositionStyles, loadDependencies } from './utils';
import { EventManager } from './events';
import { createLauncherButton, createWidgetContainer, injectWidgetStyles } from './ui-components';
import { initLazyLoadViaScroll, prepareWidgetConfig } from './lazy-loading';
import { WIDGET_VERSION, RESOURCE_INTEGRITY } from './api';

/**
 * Main widget loader class
 */
export class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private launcherElement: HTMLDivElement | null = null;
  private initialized = false;
  private widgetLoaded = false;
  private lazyLoadObserver: IntersectionObserver | null = null;
  private eventManager: EventManager;

  constructor(options: PullseChatWidgetOptions) {
    // Set default options
    this.options = {
      position: 'bottom-right',
      offsetX: 20,
      offsetY: 20,
      hideBranding: false,
      autoOpen: false,
      ...options
    };

    this.eventManager = new EventManager();

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
    
    // For lazy loading via scroll
    if (this.options.lazyLoadScroll) {
      this.lazyLoadObserver = initLazyLoadViaScroll(
        this.options, 
        this.loadFullWidget.bind(this),
        this.createContainer.bind(this)
      );
    } 
    // For auto-open, load full widget immediately
    else if (this.options.autoOpen) {
      this.createContainer();
      this.loadFullWidget();
    } 
    // Otherwise, just create the launcher button
    else {
      this.createLauncherButton();
    }
  }

  private createContainer(): void {
    // Create container element for the widget
    this.containerElement = createWidgetContainer();
    document.body.appendChild(this.containerElement);

    // Add styles
    this.injectStyles();
  }
  
  private createLauncherButton(): void {
    // Create a lightweight launcher button
    const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
    this.launcherElement = createLauncherButton(this.options, position, offsetX, offsetY);
    
    // Add click handler to load full widget
    const button = this.launcherElement.querySelector('.pullse-chat-button');
    if (button) {
      button.onclick = () => {
        this.createContainer();
        this.loadFullWidget();
        if (this.launcherElement) {
          this.launcherElement.style.display = 'none';
        }
      };
    }
    
    document.body.appendChild(this.launcherElement);
  }

  private injectStyles(): void {
    const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
    const positionStyles = getPositionStyles(position, offsetX, offsetY);
    this.styleElement = injectWidgetStyles(positionStyles);
  }

  /**
   * Add integrity attribute to a script or link element if available
   * @param element Element to add integrity to
   * @param resourceKey Key in RESOURCE_INTEGRITY
   */
  private addIntegrityAttribute(element: HTMLElement, resourceKey: string): void {
    const key = resourceKey as keyof typeof RESOURCE_INTEGRITY;
    if (RESOURCE_INTEGRITY[key]) {
      element.setAttribute('integrity', RESOURCE_INTEGRITY[key]);
      element.setAttribute('crossorigin', 'anonymous');
    }
  }

  private loadFullWidget(): void {
    // Load React dependencies first
    loadDependencies()
      .then(() => {
        // Add cache busting and version tracking
        const cacheParam = `?v=${WIDGET_VERSION}`;
        
        // Handle widget events
        const onEvent = (event: any) => {
          this.eventManager.handleEvent(event);
        };
        
        // Create config with position, branding etc.
        const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
        const config = prepareWidgetConfig(this.options, position, offsetX, offsetY);
        
        // Add event handler and version information
        config.onEvent = onEvent;
        config.version = WIDGET_VERSION;
        
        // Create global config object
        (window as any).__PULLSE_CHAT_CONFIG__ = config;
        
        // Save widget instance for global access
        (window as any).__PULLSE_CHAT_INSTANCE__ = this;
        
        // Load styles with integrity if available
        if (!document.getElementById('pullse-widget-styles')) {
          const link = document.createElement('link');
          link.id = 'pullse-widget-styles';
          link.rel = 'stylesheet';
          link.href = `https://cdn.pullse.io/widget-styles.css${cacheParam}`;
          this.addIntegrityAttribute(link, 'widget-styles.css');
          document.head.appendChild(link);
        }
        
        // Load the widget bundle with integrity
        this.scriptElement = document.createElement('script');
        this.scriptElement.src = `https://cdn.pullse.io/chat-widget.js${cacheParam}`;
        this.scriptElement.async = true;
        this.addIntegrityAttribute(this.scriptElement, 'chat-widget.js');
        
        this.scriptElement.onload = () => {
          console.log('Pullse Chat Widget loaded successfully');
          this.widgetLoaded = true;
          
          // Check for updates after successful load (delayed to not impact performance)
          if (this.options.checkUpdates !== false) {
            setTimeout(() => {
              this.checkForUpdates();
            }, 3000);
          }
        };
        
        this.scriptElement.onerror = () => {
          console.error('Failed to load Pullse Chat Widget script');
          this.eventManager.handleEvent({
            type: 'error',
            code: 'script_load_failed',
            message: 'Failed to load widget script'
          });
        };
        
        document.body.appendChild(this.scriptElement);
      })
      .catch(error => {
        console.error('Failed to load dependencies:', error);
        this.eventManager.handleEvent({
          type: 'error',
          code: 'dependencies_load_failed',
          message: 'Failed to load dependencies'
        });
      });
  }
  
  /**
   * Check for available updates and notify if found
   */
  private checkForUpdates(): void {
    // Simple XHR to check version from CDN
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://cdn.pullse.io/version.json?t=${Date.now()}`, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const versionInfo = JSON.parse(xhr.responseText);
            if (versionInfo && versionInfo.version && versionInfo.version !== WIDGET_VERSION) {
              // Log update available
              console.info(`[Pullse] A new version is available: ${versionInfo.version}`);
              
              // Trigger update event
              this.eventManager.handleEvent({
                type: 'versionUpdate',
                currentVersion: WIDGET_VERSION,
                latestVersion: versionInfo.version,
                releaseNotes: versionInfo.releaseNotes || '',
                updateUrl: versionInfo.updateUrl || 'https://docs.pullse.io/updates'
              });
            }
          } catch (err) {
            // Silently fail version check - non-critical
            console.warn('[Pullse] Version check failed:', err);
          }
        }
      }
    };
    xhr.send();
  }
  
  /**
   * Subscribe to widget events
   */
  public on(eventType: any, callback: any): () => void {
    return this.eventManager.on(eventType, callback);
  }
  
  /**
   * Unsubscribe from widget events
   */
  public off(eventType: any, callback?: any): void {
    this.eventManager.off(eventType, callback);
  }
}
