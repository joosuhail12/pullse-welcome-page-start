
// Export everything from config except processQueuedMessages
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
export * from './connection';
export * from './messaging';
export * from './presence';
