
import { ChatEventType, ChatEventPayload, ChatWidgetConfig } from '../config';

/**
 * Dispatches a chat widget event as a CustomEvent on the window object
 * and calls the optional onEvent callback if provided in the config
 * 
 * @param eventType The type of event to dispatch
 * @param data Optional data to include with the event
 * @param config The chat widget configuration
 */
export function dispatchChatEvent(
  eventType: ChatEventType, 
  data?: any, 
  config?: ChatWidgetConfig
): void {
  // Create event payload
  const payload: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data
  };
  
  // Dispatch window CustomEvent
  window.dispatchEvent(
    new CustomEvent(eventType, {
      detail: payload,
      bubbles: true,
      cancelable: true
    })
  );
  
  // Call the onEvent callback if provided
  if (config?.onEvent) {
    try {
      config.onEvent(payload);
    } catch (error) {
      console.error('Error in chat widget onEvent callback:', error);
    }
  }
}
