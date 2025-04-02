
export function loadWidgetResources(): HTMLScriptElement {
  // Create a script tag to load the widget bundle
  const script = document.createElement('script');
  script.src = 'https://cdn.pullse.com/chat-widget.js';
  script.async = true;
  document.head.appendChild(script);
  
  return script;
}
