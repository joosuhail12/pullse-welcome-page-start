
/**
 * Loads the widget resources and returns the created script element
 */
export function loadWidgetResources(): HTMLScriptElement {
  console.log('loadWidgetResources: Starting to load widget resources');
  
  // Create a script tag to load the widget bundle
  const script = document.createElement('script');
  
  // Use the correct path for the widget bundle
  // In development, use a local path; in production, use the CDN path
  const isDev = process.env.NODE_ENV === 'development';
  
  // IMPORTANT: Always load the built JavaScript file, never load .ts files directly
  // For local development, use the correct path to the processed JS file
  script.src = isDev ? '/dist/embed.js' : 'https://cdn.pullse.com/chat-widget.js';
  
  script.async = true;
  script.type = 'module'; // Add the correct script type for modules
  
  // Add debug info as data attributes
  script.dataset.source = 'widget-loader';
  script.dataset.timestamp = new Date().toISOString();
  
  // Add more detailed error handling
  script.onerror = (error) => {
    console.error('Failed to load chat widget script:', error, 'from src:', script.src);
    
    // Try fallback path as last resort
    if (isDev) {
      console.log('Trying fallback path for development');
      script.src = '/src/embed.js';
      
      // Re-append to trigger loading with new path
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      document.head.appendChild(script);
    }
  };
  
  // The script needs to be added to the document to load
  document.head.appendChild(script);
  
  // Add a helper log to debug loading issues
  console.log('Loading chat widget resources from:', script.src);
  
  return script;
}
