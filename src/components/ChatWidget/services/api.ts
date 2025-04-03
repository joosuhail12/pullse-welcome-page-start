
/**
 * Chat Widget API Service
 * 
 * Re-exports API functions from specialized modules.
 * This file serves as the main entry point for API operations.
 * 
 * SECURITY NOTICE: API communications implement security features 
 * including circuit breaking, retries, and resilience.
 */

// Re-export security API functions
export { serverSideEncrypt, serverSideDecrypt } from './securityApi';

// Re-export configuration API functions
export { fetchChatWidgetConfig } from './configApi';

// Re-export messaging API functions
export { sendChatMessage } from './messageApi';

// Re-export core API utilities for advanced usage
export {
  createSecureHeaders,
  verifyResponseIntegrity,
  validateJsonResponse,
  handleApiError,
  enforceSecureConnection,
  checkCircuitStatus,
  sanitizeApiInputs,
  // Circuit names
  CONFIG_CIRCUIT,
  MESSAGE_CIRCUIT,
  SECURITY_CIRCUIT
} from './apiCore';
