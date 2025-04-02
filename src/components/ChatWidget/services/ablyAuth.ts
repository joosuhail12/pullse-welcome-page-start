
import { getChatSessionId } from '../utils/cookies';
import { generateCsrfToken, signMessage } from '../utils/security';

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
    const csrfToken = generateCsrfToken();
    
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

    // In development mode, return mock token for testing
    if (import.meta.env.DEV) {
      console.log('Using mock token in development mode');
      return mockTokenResponse(params);
    }

    const response = await fetch('/api/chat-widget/token', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Ably token: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting Ably token:', error);
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
