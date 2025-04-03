
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
  
  // Define CSP directives
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
    "frame-ancestors 'self' https://lovableproject.com"
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
 * Create a Shadow DOM container for the widget
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
  
  // Create Shadow DOM with 'open' mode
  const shadow = container.attachShadow({ mode: 'open' });
  
  // Add base styles for Shadow DOM encapsulation
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      display: block;
      position: relative;
      contain: content;
      font-family: system-ui, sans-serif;
    }
  `;
  shadow.appendChild(style);
  
  return shadow;
}

/**
 * Initialize security features for the embedded widget
 * @param containerId ID of the container element
 * @returns Container element for the widget
 */
export function initializeEmbedSecurity(containerId: string = 'pullse-chat-widget-container'): HTMLDivElement {
  // Create container element if it doesn't exist
  let container = document.getElementById(containerId) as HTMLDivElement;
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  // Try to use Shadow DOM for stronger isolation
  try {
    const shadow = createShadowContainer(container);
    
    // Create a div inside the shadow DOM for the widget
    const innerContainer = document.createElement('div');
    innerContainer.className = 'pullse-chat-widget-inner';
    shadow.appendChild(innerContainer);
    
    // Inject CSP into the shadow DOM
    injectCSP(shadow);
    
    // Add an attribute to the container to indicate Shadow DOM is being used
    container.setAttribute('data-pullse-uses-shadow', 'true');
  } catch (e) {
    console.warn('Failed to initialize Shadow DOM for widget isolation', e);
    // Fallback to standard DOM if Shadow DOM fails
    container.setAttribute('data-pullse-uses-shadow', 'false');
  }
  
  return container;
}
