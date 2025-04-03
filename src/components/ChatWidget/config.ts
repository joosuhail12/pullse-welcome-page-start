
// Add this export to your existing config.ts file to extend ChatEventType
export type ChatEventType =
  | 'chat:open'
  | 'chat:close'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'chat:typingStarted'
  | 'chat:typingStopped'
  | 'contact:initiatedChat'
  | 'contact:identified'
  | 'chat:ended'
  | 'message:sent'
  | 'message:delivered'
  | 'message:read'
  | 'message:reacted'
  | 'message:fileUploaded'
  | 'error'
  | 'chat:connectionChange'
  | string; // Allow string extension for dynamic events
