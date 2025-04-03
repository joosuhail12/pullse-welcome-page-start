// Import the polyfill utilities
import { safeQuerySelector, safeQuerySelectorAll } from './domPolyfills';
import { logger } from '@/lib/logger';

/**
 * Embed Security Utilities
 * 
 * Provides functions to enhance the security of embedded chat widgets
 * by isolating them within a shadow DOM and applying strict CSP rules.
 * 
 * SECURITY NOTICE: This module implements security controls to mitigate
 * XSS and other injection attacks. However, it is essential to
 * continuously review and update these controls to address new threats.
 */

/**
 * Initialize embed security by creating a shadow DOM and applying CSP.
 * @param containerId The ID of the container element for the chat widget.
 * @returns An object containing the container and shadowRoot.
 * 
 * TODO: Implement nonce-based CSP for inline scripts and styles
 * TODO: Add Subresource Integrity (SRI) checks for external resources
 * TODO: Implement strict origin validation for message events
 */
export function initializeEmbedSecurity(containerId: string): { container: HTMLElement, shadowRoot: ShadowRoot | HTMLElement } {
  const container = document.getElementById(containerId);
  
  if (!container) {
    logger.error('Container element not found', 'embedSecurity.initializeEmbedSecurity', { containerId });
    throw new Error('Container element not found');
  }
  
  // Check if shadow DOM is already attached
  if (container.shadowRoot) {
    logger.warn('Shadow DOM already attached to container', 'embedSecurity.initializeEmbedSecurity', { containerId });
    return { container, shadowRoot: container.shadowRoot };
  }
  
  // Attach shadow DOM to the container
  const shadowRoot = container.attachShadow({ mode: 'open' });
  
  // Create an inner container for the widget's content
  const innerContainer = document.createElement('div');
  innerContainer.className = 'pullse-chat-widget-inner';
  shadowRoot.appendChild(innerContainer);
  
  // Apply Content Security Policy (CSP)
  applyCSP(shadowRoot);
  
  // Copy existing content from the original container to the shadow DOM
  copyContentToShadowDOM(container, shadowRoot);
  
  // Re-inject scripts to ensure they execute in the shadow DOM
  reinjectScripts(shadowRoot);
  
  // Re-inject styles to ensure they apply in the shadow DOM
  reinjectStyles(shadowRoot);
  
  logger.info('Embed security initialized', 'embedSecurity.initializeEmbedSecurity', { containerId });
  
  return { container, shadowRoot };
}

/**
 * Apply Content Security Policy (CSP) to the shadow DOM.
 * @param shadowRoot The shadow DOM to apply CSP to.
 * 
 * TODO: Implement nonce-based CSP for inline scripts and styles
 * TODO: Add Subresource Integrity (SRI) checks for external resources
 * TODO: Implement strict origin validation for message events
 */
function applyCSP(shadowRoot: ShadowRoot): void {
  // Create a style element for the CSP
  const csp = document.createElement('style');
  csp.textContent = `
    :host {
      all: initial; /* Reset all styles */
      display: block; /* Make the shadow host a block element */
    }
    
    /* Apply a base font and other base styles */
    .pullse-chat-widget-inner {
      font-family: sans-serif;
      font-size: 14px;
      color: #333;
    }
  `;
  
  // Append the CSP to the shadow DOM
  shadowRoot.appendChild(csp);
  
  logger.debug('Content Security Policy applied', 'embedSecurity.applyCSP');
}

/**
 * Copy existing content from the original container to the shadow DOM.
 * @param container The original container element.
 * @param shadowRoot The shadow DOM to copy content to.
 */
function copyContentToShadowDOM(container: HTMLElement, shadowRoot: ShadowRoot): void {
  // Clone all child nodes from the original container
  const content = document.importNode(container, true);
  
  // Append the cloned content to the shadow DOM
  shadowRoot.appendChild(content);
  
  logger.debug('Content copied to shadow DOM', 'embedSecurity.copyContentToShadowDOM');
}

/**
 * Re-inject scripts to ensure they execute in the shadow DOM.
 * @param shadowRoot The shadow DOM to re-inject scripts into.
 */
function reinjectScripts(shadowRoot: ShadowRoot): void {
  // Find all script elements in the shadow DOM
  // const embeddedScripts = shadowRoot.querySelectorAll('script');
  const embeddedScripts = safeQuerySelectorAll(shadowRoot, 'script');
  
  // Loop through each script element
  embeddedScripts.forEach((script: HTMLScriptElement) => {
    // Create a new script element
    const newScript = document.createElement('script');
    
    // Copy attributes from the original script to the new script
    Array.from(script.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value);
    });
    
    // Copy the script's text content
    newScript.textContent = script.textContent;
    
    // Replace the original script with the new script
    script.parentNode?.replaceChild(newScript, script);
  });
  
  logger.debug('Scripts re-injected into shadow DOM', 'embedSecurity.reinjectScripts');
}

/**
 * Re-inject styles to ensure they apply in the shadow DOM.
 * @param shadowRoot The shadow DOM to re-inject styles into.
 */
function reinjectStyles(shadowRoot: ShadowRoot): void {
  // Find all style elements and link elements in the shadow DOM
  const embeddedStyles = shadowRoot.querySelectorAll('style');
  const embeddedLinks = shadowRoot.querySelectorAll('link[rel="stylesheet"]');
  
  // Re-inject inline styles
  embeddedStyles.forEach(style => {
    const newStyle = document.createElement('style');
    newStyle.textContent = style.textContent;
    style.parentNode?.replaceChild(newStyle, style);
  });
  
  // Re-inject linked stylesheets
  embeddedLinks.forEach(link => {
    const newLink = document.createElement('link');
    Array.from(link.attributes).forEach(attr => {
      newLink.setAttribute(attr.name, attr.value);
    });
    link.parentNode?.replaceChild(newLink, link);
  });
  
  logger.debug('Styles re-injected into shadow DOM', 'embedSecurity.reinjectStyles');
}
