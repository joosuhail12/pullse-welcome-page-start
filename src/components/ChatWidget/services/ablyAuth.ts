
import { getChatSessionId } from '../utils/cookies';
import { generateCsrfToken, signMessage } from '../utils/security';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { auditLogger } from '@/lib/audit-logger';

interface TokenParams {
  workspaceId: string;
  channelName?: string;
  clientId?: string;
}

/**
 * Request Ably capability token from server
 * @param params Token request parameters
 * @returns Token response from server
 */
export const requestAblyToken = async (params: TokenParams): Promise<any> => {
  try {
    const sessionId = getChatSessionId();
    const timestamp = Date.now();
    const { token: csrfToken } = generateCsrfToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'X-Request-Timestamp': timestamp.toString(),
      'X-Request-Signature': signMessage(params.workspaceId, timestamp)
    };

    const payload = {
      ...params,
      sessionId,
      timestamp
    };

    // Log token request attempt
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.TOKEN_ISSUED,
      'ATTEMPT',
      { 
        service: 'ably', 
        workspaceId: params.workspaceId,
        channelName: params.channelName
      }
    );

    // In development mode, return mock token for testing
    if (import.meta.env.DEV) {
      logger.debug('Using mock Ably token in development mode', 'ablyAuth.requestToken');
      const mockToken = mockTokenResponse(params);
      
      // Log successful mock token generation
      auditLogger.logSecurityEvent(
        auditLogger.SecurityEventType.TOKEN_ISSUED,
        'SUCCESS',
        { 
          service: 'ably',
          environment: 'development',
          mock: true,
          workspaceId: params.workspaceId
        }
      );
      
      return mockToken;
    }

    const response = await fetch('/api/chat-widget/token', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      // Log token request failure
      auditLogger.logSecurityEvent(
        auditLogger.SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        { 
          service: 'ably',
          statusCode: response.status,
          error: sanitizeErrorMessage(errorText),
          workspaceId: params.workspaceId
        },
        'HIGH'
      );
      
      throw new Error(`Failed to fetch Ably token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenResponse = await response.json();
    
    // Log successful token issuance
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.TOKEN_ISSUED,
      'SUCCESS',
      { 
        service: 'ably',
        workspaceId: params.workspaceId,
        issued: tokenResponse.issued,
        expires: tokenResponse.expires
      }
    );
    
    return tokenResponse;
  } catch (error) {
    const safeErrorMessage = sanitizeErrorMessage(error);
    logger.error('Error requesting Ably token', 'ablyAuth.requestToken', { error: safeErrorMessage });
    
    // Log token request exception
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.TOKEN_REJECTED,
      'FAILURE',
      { 
        service: 'ably',
        error: safeErrorMessage,
        workspaceId: params.workspaceId
      },
      'HIGH'
    );
    
    throw error;
  }
};

/**
 * Get the authentication URL with capabilities
 * @param workspaceId Workspace ID for the token
 * @returns Full auth URL that can be used by Ably
 */
export const getAblyAuthUrl = (workspaceId: string): string => {
  // In development, we'll return a mock URL that will be intercepted
  if (import.meta.env.DEV) {
    return '/mock-auth/ably-token';
  }
  
  return `/api/chat-widget/token?workspaceId=${encodeURIComponent(workspaceId)}`;
};

// Mock token response for development
function mockTokenResponse(params: TokenParams): any {
  // This is just for development - in production, tokens come from server
  return {
    token: "mockAblyToken_" + Date.now(),
    issued: Date.now(),
    expires: Date.now() + 3600000, // 1 hour
    capability: {
      [`conversation:*`]: ["subscribe", "presence"],
      [`session:*`]: ["subscribe", "publish"],
      [`workspace:${params.workspaceId}:presence`]: ["presence", "subscribe"]
    },
    clientId: params.clientId || getChatSessionId()
  };
}
