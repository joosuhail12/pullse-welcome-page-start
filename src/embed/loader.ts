
/**
 * Loads the widget resources and returns the created script element
 */
export function loadWidgetResources(): HTMLScriptElement {
  // Create a script tag to load the widget bundle
  const script = document.createElement('script');
  
  // Use the correct path for the widget bundle
  // In development, use a local path; in production, use the CDN path
  const isDev = process.env.NODE_ENV === 'development';
  
  // Use the correct path for local development (resolver will handle this)
  // The key issue was that we were loading a .ts file directly which browsers can't execute
  script.src = isDev ? '/src/embed.js' : 'https://cdn.pullse.com/chat-widget.js';
  
  script.async = true;
  script.type = 'module'; // Add the correct script type for modules
  
  // Add debug info as data attributes
  script.dataset.source = 'widget-loader';
  script.dataset.timestamp = new Date().toISOString();
  
  // The script needs to be added to the document to load
  document.head.appendChild(script);
  
  // Add a helper log to debug loading issues
  console.log('Loading chat widget resources from:', script.src);
  
  return script;
}
