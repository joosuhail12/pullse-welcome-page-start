
/**
 * Generate the URL to use for Ably authentication
 * @param workspaceId Workspace ID to authenticate against
 * @returns Authentication URL
 */
export const getAblyAuthUrl = (workspaceId: string): string => {
  const baseUrl = 'https://dev-socket.pullseai.com/api/ably/widgetToken';
  return `${baseUrl}`;
};

/**
 * Get an authentication signature for Ably
 * @param tokenRequest Token request data
 * @returns Signature data
 */
export const getAuthSignature = async (tokenRequest: any): Promise<{ signature: string }> => {
  try {
    const response = await fetch('/api/chat/ably-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokenRequest)
    });

    if (!response.ok) {
      throw new Error(`Auth request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting auth signature:', error);
    throw error;
  }
};
