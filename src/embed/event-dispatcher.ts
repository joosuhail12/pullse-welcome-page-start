
/**
 * Dispatches widget events using a consistent approach
 */
export function dispatchWidgetEvent(action: 'open' | 'close' | 'toggle' | string, detail?: any): void {
  const eventName = action.startsWith('pullse:') ? action : `pullse:widget:${action}`;
  const event = new CustomEvent(eventName, { detail });
  console.log(`Dispatching event: ${eventName}`, detail || '');
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
