
/**
 * Security utilities for widget embedding
 */

/**
 * Creates a meta tag with CSP directives for widget embedding
 * @param hostElement The element to append the meta tag to
 */
export function injectCSP(hostElement: Element | Document = document): void {
  // Create the meta tag for CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  
  // Define CSP directives with improved mobile support
  meta.content = [
    "default-src 'self' https://cdn.pullse.io",
    "script-src 'self' https://cdn.pullse.io https://unpkg.com 'sha256-CALCULATED_HASH_HERE'",
    "style-src 'self' 'unsafe-inline' https://cdn.pullse.io https://unpkg.com",
    "img-src 'self' data: https://cdn.pullse.io https://*.githubusercontent.com",
    "connect-src 'self' https://*.pullse.io https://api.pullse.io",
    "font-src 'self' https://cdn.pullse.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://*.lovableproject.com https://*.pullse.io"
  ].join('; ');
  
  // Add the meta tag to the document head or host element
  const targetElement = hostElement === document ? document.head : hostElement;
  targetElement.appendChild(meta);
}

/**
 * Add Subresource Integrity (SRI) attributes to script tags
 * @param scriptUrl The URL of the script
 * @param integrity Integrity hash for the script
 * @returns Script element with SRI attributes
 */
export function createScriptWithSRI(scriptUrl: string, integrity?: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = true;
  script.crossOrigin = 'anonymous';
  
  if (integrity) {
    script.integrity = integrity;
  }
  
  return script;
}

/**
 * Create a Shadow DOM container for the widget with enhanced isolation
 * This provides stronger isolation from the host page
 * @param container The container element to attach the Shadow DOM to
 * @returns The Shadow DOM root element
 */
export function createShadowContainer(container: HTMLElement): ShadowRoot {
  // Check if browser supports Shadow DOM
  if (!container.attachShadow) {
    console.warn('Shadow DOM not supported, falling back to regular DOM');
    return container as any;
  }
  
  // Create Shadow DOM with 'open' mode for better script access
  const shadow = container.attachShadow({ mode: 'open' });
  
  // Add base styles for Shadow DOM encapsulation with improved mobile support and isolation
  const style = document.createElement('style');
  style.textContent = `
    /* Reset all inherited styles for perfect isolation */
    :host {
      all: initial;
      display: block;
      position: relative;
      contain: content;
      font-family: system-ui, sans-serif;
      z-index: 999999;
      color-scheme: light;
    }
    
    /* Ensure all text styles are explicitly defined */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                   Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    /* Responsive container styles */
    .pullse-chat-widget-inner {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 999999;
    }
    
    /* Ensure container allows for proper widget positioning */
    @media (max-width: 640px) {
      :host {
        overflow: visible !important;
      }
    }
  `;
  shadow.appendChild(style);
  
  return shadow;
}

/**
 * Initialize security features for the embedded widget with enhanced isolation
 * @param containerId ID of the container element
 * @returns Container and shadow root for the widget
 */
export function initializeEmbedSecurity(containerId: string = 'pullse-chat-widget-container'): { 
  container: HTMLDivElement; 
  shadowRoot: ShadowRoot | HTMLDivElement;
} {
  // Create container element if it doesn't exist
  let container = document.getElementById(containerId) as HTMLDivElement;
  let shadowRoot: ShadowRoot | HTMLDivElement;
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.right = '0';
    container.style.zIndex = '999999';
    document.body.appendChild(container);
  }
  
  // Try to use Shadow DOM for stronger isolation
  try {
    shadowRoot = createShadowContainer(container);
    
    // Create a div inside the shadow DOM for the widget
    const innerContainer = document.createElement('div');
    innerContainer.className = 'pullse-chat-widget-inner';
    shadowRoot.appendChild(innerContainer);
    
    // Add viewport meta tag for proper mobile rendering
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    shadowRoot.appendChild(viewport);
    
    // Inject CSP into the shadow DOM
    injectCSP(shadowRoot);
    
    // Add an attribute to the container to indicate Shadow DOM is being used
    container.setAttribute('data-pullse-uses-shadow', 'true');
  } catch (e) {
    console.warn('Failed to initialize Shadow DOM for widget isolation', e);
    // Fallback to standard DOM if Shadow DOM fails
    container.setAttribute('data-pullse-uses-shadow', 'false');
    shadowRoot = container;
  }
  
  return { container, shadowRoot };
}

// Helper function to check if the device is mobile
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 640);
}

// Add responsive meta tag to parent document if embedded
export function ensureResponsiveMetaTags(): void {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
  }
}
