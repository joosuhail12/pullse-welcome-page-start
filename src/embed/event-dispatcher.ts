
/**
 * Dispatches widget events using a consistent approach
 */
export function dispatchWidgetEvent(action: 'open' | 'close' | 'toggle' | string, detail?: any): void {
  // Ensure consistent event naming pattern
  const eventName = action.startsWith('pullse:') ? action : 
                    action.startsWith('widget:') ? `pullse:${action}` : 
                    `pullse:widget:${action}`;
                    
  console.log(`📢 Dispatching event: ${eventName}`, detail || '');
  
  // Create and dispatch the custom event
  const event = new CustomEvent(eventName, { 
    detail,
    bubbles: true,  // Allow event to bubble up the DOM
    cancelable: true // Allow event to be cancelled
  });
  
  window.dispatchEvent(event);
}

/**
 * Standardized event names to prevent duplication and errors
 */
export const WIDGET_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  TOGGLE: 'toggle',
  LOADED: 'loaded',
  MESSAGE: 'message'
};

/**
 * Helper function to listen for widget events
 */
export function addWidgetEventListener(
  eventName: string, 
  callback: (event: CustomEvent) => void
): () => void {
  const fullEventName = eventName.startsWith('pullse:') ? eventName : `pullse:widget:${eventName}`;
  
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  
  window.addEventListener(fullEventName, handler);
  
  // Return a function to remove the event listener
  return () => window.removeEventListener(fullEventName, handler);
}
