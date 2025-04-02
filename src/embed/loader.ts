
/**
 * Loads the widget resources and returns the created script element
 */
export function loadWidgetResources(): HTMLScriptElement {
  // Create a script tag to load the widget bundle
  const script = document.createElement('script');
  
  // Use the correct path for the widget bundle
  // In development, use a local path; in production, use the CDN path
  const isDev = process.env.NODE_ENV === 'development';
  
  // Ensure we're loading the correct file - use embed.ts for local development
  script.src = isDev ? '/src/embed.ts' : 'https://cdn.pullse.com/chat-widget.js';
  
  script.async = true;
  script.type = 'module'; // Add the correct script type for modules
  
  // The script needs to be added to the document to load
  document.head.appendChild(script);
  
  // Add a helper log to debug loading issues
  console.log('Loading chat widget resources from:', script.src);
  
  return script;
}
