
import { dispatchWidgetEvent, WIDGET_EVENTS, addWidgetEventListener } from './event-dispatcher';
import { ChatWidgetInterface } from './types';

/**
 * Creates the public API methods for the widget with consistent behavior
 */
export function createWidgetAPI(): Partial<ChatWidgetInterface> {
  return {
    open: () => {
      console.log('Opening chat widget via API');
      dispatchWidgetEvent(WIDGET_EVENTS.OPEN);
    },
    close: () => {
      console.log('Closing chat widget via API');
      dispatchWidgetEvent(WIDGET_EVENTS.CLOSE);
    },
    toggle: () => {
      console.log('Toggling chat widget via API');
      dispatchWidgetEvent(WIDGET_EVENTS.TOGGLE);
    },
    on: (eventName: string, callback: (detail: any) => void) => {
      return addWidgetEventListener(eventName, (event) => callback(event.detail));
    },
    off: (eventName: string, handler: EventListener) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:widget:';
      const fullEventName = `${eventPrefix}${eventName}`;
      window.removeEventListener(fullEventName, handler);
    }
  };
}
