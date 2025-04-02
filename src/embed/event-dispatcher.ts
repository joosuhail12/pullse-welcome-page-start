
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
  
  // Debug help - log when the event might not be handled
  setTimeout(() => {
    const listenerCount = getEventListenerCount(window, eventName);
    if (listenerCount === 0) {
      console.warn(`⚠️ No event listeners found for ${eventName} - widget might not respond`);
    }
  }, 50);
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
  
  console.log(`➕ Adding event listener for: ${fullEventName}`);
  
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  
  window.addEventListener(fullEventName, handler);
  
  // Return a function to remove the event listener
  return () => {
    console.log(`➖ Removing event listener for: ${fullEventName}`);
    window.removeEventListener(fullEventName, handler);
  };
}

/**
 * Utility to count event listeners (for debugging)
 * Note: This is an approximation, as browsers don't expose the exact listener count
 */
function getEventListenerCount(element: Window | HTMLElement, eventName: string): number {
  try {
    // This is a non-standard way to access event listeners and may not work in all browsers
    const listeners = (element as any).eventListeners?.(eventName);
    return listeners ? listeners.length : 0;
  } catch (e) {
    return 0; // If we can't access listeners, return 0
  }
}

/**
 * Force trigger an event even if the main dispatcher might be having issues
 */
export function forceTriggerEvent(eventName: string, detail?: any): void {
  try {
    console.log(`🔥 Force triggering event: ${eventName}`);
    
    // Try different namespaces to maximize chances of success
    [
      eventName,
      `pullse:widget:${eventName}`,
      `pullse:${eventName}`,
      `widget:${eventName}`
    ].forEach(name => {
      window.dispatchEvent(new CustomEvent(name, { 
        detail, 
        bubbles: true,
        cancelable: true
      }));
    });
  } catch (e) {
    console.error('Failed to force trigger event:', e);
  }
}
