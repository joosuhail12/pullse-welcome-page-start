
import { ChatWidgetConfig } from '../config';

// Extended interface to handle custom properties
export interface ExtendedChatWidgetConfig extends ChatWidgetConfig {
  styles?: Record<string, string>;
  customCSS?: string;
}

// Function to generate a unique ID for the chat widget
export function generateWidgetId(): string {
  return 'chat-widget-' + Math.random().toString(36).substring(2, 15);
}

// Function to inject the chat widget into the DOM
export function injectChatWidget(widgetId: string, config: ExtendedChatWidgetConfig): void {
  // Check if the widget already exists
  if (document.getElementById(widgetId)) {
    console.warn(`Chat widget with ID "${widgetId}" already exists. Skipping injection.`);
    return;
  }

  // Create the main container for the chat widget
  const chatWidgetContainer = document.createElement('div');
  chatWidgetContainer.id = widgetId;
  chatWidgetContainer.className = 'chat-widget-container';

  // Apply custom styles from the configuration
  if (config.styles) {
    Object.assign(chatWidgetContainer.style, config.styles);
  }

  // Append the chat widget container to the body
  document.body.appendChild(chatWidgetContainer);
}

// Function to remove the chat widget from the DOM
export function removeChatWidget(widgetId: string): void {
  const chatWidgetContainer = document.getElementById(widgetId);
  if (chatWidgetContainer) {
    document.body.removeChild(chatWidgetContainer);
  }
}

// Function to apply custom CSS to the chat widget
export function applyCustomCSS(widgetId: string, config: ExtendedChatWidgetConfig): void {
  const shadowRoot = document.getElementById(widgetId)?.shadowRoot;

  if (shadowRoot && config.customCSS) {
    const styleElement = document.createElement('style');
    styleElement.textContent = config.customCSS;
    shadowRoot.appendChild(styleElement);
  }
}

// Function to collect all CSS styles from the DOM
export function collectDomStyles(): string {
  const styles: string[] = [];

  // Collect styles from all style tags
  const styleElements = Array.from(document.querySelectorAll('style'));
  styleElements.forEach((styleEl) => {
    styles.push(styleEl.textContent || '');
  });

  // Collect styles from all link tags with rel="stylesheet"
  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  linkElements.forEach((linkEl) => {
    // Need to cast linkEl to HTMLLinkElement to access href property
    const linkHref = (linkEl as HTMLLinkElement).href;
    if (linkHref) {
      // Fetch the CSS file and add its content to the styles array
      fetch(linkHref)
        .then(response => response.text())
        .then(css => styles.push(css))
        .catch(error => console.error('Error fetching CSS:', error));
    }
  });

  return styles.join('\n');
}

// Function to get DOM styles from a ShadowRoot
export function getDomStyles(shadowRoot: ShadowRoot): string {
  const styles: string[] = [];

  // Convert ShadowRoot to an element-like object for document.querySelectorAll
  const styleElements = Array.from(shadowRoot.querySelectorAll('style'));

  styleElements.forEach((styleEl) => {
    styles.push(styleEl.textContent || '');
  });

  return styles.join('\n');
}

// Function to create a Shadow DOM for the chat widget
export function createShadowDOM(widgetId: string, styles: string, config: ExtendedChatWidgetConfig): ShadowRoot | null {
  const chatWidgetContainer = document.getElementById(widgetId);

  if (!chatWidgetContainer) {
    console.error(`Chat widget with ID "${widgetId}" not found.`);
    return null;
  }

  // Create a shadow root
  const shadowRoot = chatWidgetContainer.attachShadow({ mode: 'open' });

  // Create a style element and add the collected styles
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // Apply custom CSS if provided
  if (config.customCSS) {
    const customStyleElement = document.createElement('style');
    customStyleElement.textContent = config.customCSS;
    shadowRoot.appendChild(customStyleElement);
  }

  return shadowRoot;
}

// Function to initialize embed security
export function initializeEmbedSecurity(containerId: string): { container: HTMLElement | null; shadowRoot: ShadowRoot | null } {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return { container: null, shadowRoot: null };
  }

  // Check if shadow root already exists
  const existingShadowRoot = container.shadowRoot;
  if (existingShadowRoot) {
    return { container, shadowRoot: existingShadowRoot };
  }

  // Create a shadow root for isolation
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Create inner container for the chat widget
  const innerContainer = document.createElement('div');
  innerContainer.className = 'pullse-chat-widget-inner';
  shadowRoot.appendChild(innerContainer);

  return { container, shadowRoot };
}