
import { getFullEventName } from './constants';

export const eventHandlers = {
  on: (eventName: string, callback: (detail: any) => void) => {
    const fullEventName = getFullEventName(eventName);
    
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    
    window.addEventListener(fullEventName, handler as EventListener);
    
    // Return unsubscribe function
    return () => window.removeEventListener(fullEventName, handler as EventListener);
  },
  
  off: (eventName: string, handler: EventListener) => {
    const fullEventName = getFullEventName(eventName);
    window.removeEventListener(fullEventName, handler);
  }
};
