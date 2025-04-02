
import { dispatchWidgetEvent } from './event-dispatcher';
import { ChatWidgetInterface } from './types';

/**
 * Creates the public API methods for the widget
 */
export function createWidgetAPI(): Partial<ChatWidgetInterface> {
  return {
    open: () => {
      console.log('Opening chat widget via API');
      dispatchWidgetEvent('open');
    },
    close: () => {
      dispatchWidgetEvent('close');
    },
    toggle: () => {
      dispatchWidgetEvent('toggle');
    },
    on: (eventName: string, callback: (detail: any) => void) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      
      const handler = (event: CustomEvent) => {
        callback(event.detail);
      };
      
      window.addEventListener(fullEventName, handler as EventListener);
      return () => window.removeEventListener(fullEventName, handler as EventListener);
    },
    off: (eventName: string, handler: EventListener) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      window.removeEventListener(fullEventName, handler);
    }
  };
}
