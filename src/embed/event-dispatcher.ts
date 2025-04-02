
/**
 * Dispatches a widget event
 */
export function dispatchWidgetEvent(action: 'open' | 'close' | 'toggle'): void {
  const event = new CustomEvent(`pullse:widget:${action}`);
  window.dispatchEvent(event);
}
