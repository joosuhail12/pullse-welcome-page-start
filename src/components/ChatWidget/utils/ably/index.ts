
// Export connection functionality
export {
  initializeAbly,
  cleanupAbly,
  reconnectAbly,
  closeAblyConnection,
  initializeAblyClient
} from './connection';

// Export everything from config
export {
  getAblyClient,
  setAblyClient,
  isInFallbackMode,
  setFallbackMode,
  getPendingMessages,
  setPendingMessages,
  addPendingMessage,
  clearPendingMessages,
  processQueuedMessages
} from './config';

// Export everything from other modules
export * from './messaging';
export * from './presence';
