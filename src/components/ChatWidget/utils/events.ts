
import { ChatEventType, ChatEventPayload, ChatWidgetConfig } from '../config';

/**
 * Dispatches a chat widget event as a CustomEvent on the window object
 * and calls the appropriate callbacks in the config
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
    new CustomEvent(`pullse:${eventType}`, {
      detail: payload,
      bubbles: true,
      cancelable: true
    })
  );
  
  // Call the legacy onEvent callback if provided
  if (config?.onEvent) {
    try {
      config.onEvent(payload);
    } catch (error) {
      console.error('Error in chat widget onEvent callback:', error);
    }
  }
  
  // Call specific event handlers if provided
  if (config?.events?.[eventType]) {
    try {
      config.events[eventType]?.forEach(handler => {
        handler(payload);
      });
    } catch (error) {
      console.error(`Error in chat widget ${eventType} event handler:`, error);
    }
  }
}

/**
 * Subscribes to a specific chat widget event
 * 
 * @param eventType The type of event to subscribe to
 * @param callback The callback to call when the event is dispatched
 * @returns A function to unsubscribe from the event
 */
export function subscribeToChatEvent(
  eventType: ChatEventType,
  callback: (payload: ChatEventPayload) => void
): () => void {
  const eventName = `pullse:${eventType}`;
  
  const handleEvent = (event: CustomEvent<ChatEventPayload>) => {
    callback(event.detail);
  };
  
  window.addEventListener(eventName, handleEvent as EventListener);
  
  return () => {
    window.removeEventListener(eventName, handleEvent as EventListener);
  };
}

/**
 * Registers a callback for a specific chat widget event in the config
 * 
 * @param config The chat widget configuration to modify
 * @param eventType The type of event to register for
 * @param callback The callback to call when the event is dispatched
 * @returns The updated config with the new event handler
 */
export function registerEventHandler(
  config: ChatWidgetConfig,
  eventType: ChatEventType,
  callback: (payload: ChatEventPayload) => void
): ChatWidgetConfig {
  const updatedConfig = {
    ...config,
    events: {
      ...config.events,
      [eventType]: [...(config.events?.[eventType] || []), callback]
    }
  };
  
  return updatedConfig;
}
