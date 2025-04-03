
import { v4 as uuidv4 } from 'uuid';
import { generateSecureToken, hashData } from './cryptoUtils';
import { validateInput } from '../validation';
import { rateLimitStore } from './rateLimit';
import { SecurityEventType, securityLogger } from './SecurityEventTypes';

interface SessionInfo {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  isAuthenticated: boolean;
  csrfToken: string;
  refreshToken?: string;
  data: Record<string, any>;
}

// Session storage
const sessions: Record<string, SessionInfo> = {};

// Constants
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS_PER_USER = 5;

// Clean up expired sessions
setInterval(() => {
  const now = Date.now();
  Object.keys(sessions).forEach(sessionId => {
    if (sessions[sessionId].expiresAt < now) {
      delete sessions[sessionId];
      
      // Also clean up any rate limits for the user
      if (sessions[sessionId]?.userId) {
        delete rateLimitStore[sessions[sessionId].userId];
      }
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

// Create a new session
export const createSession = (
  userId: string,
  ipAddress: string,
  userAgent: string,
  isAuthenticated: boolean = false
): SessionInfo => {
  // Validate inputs
  if (!validateInput(userId, 'userId') || 
      !validateInput(ipAddress, 'ipAddress') || 
      !validateInput(userAgent, 'userAgent')) {
    securityLogger.logSecurityEvent(
      SecurityEventType.VALIDATION,
      'FAILURE',
      { userId, ipAddress, userAgent },
      'MEDIUM'
    );
    throw new Error('Invalid session data');
  }

  // Check if user has too many active sessions
  const userSessions = Object.values(sessions).filter(session => session.userId === userId);
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    // Remove oldest session
    const oldestSession = userSessions.reduce((oldest, current) => 
      current.createdAt < oldest.createdAt ? current : oldest
    );
    delete sessions[oldestSession.id];
    
    securityLogger.logSecurityEvent(
      SecurityEventType.SESSION,
      'WARNING',
      { userId, reason: 'Max sessions exceeded', removed: oldestSession.id },
      'LOW'
    );
  }
  
  // Create new session
  const now = Date.now();
  const sessionId = uuidv4();
  const csrfToken = generateSecureToken();
  
  const session: SessionInfo = {
    id: sessionId,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    ipAddress,
    userAgent,
    isAuthenticated,
    csrfToken,
    data: {}
  };
  
  // Store session
  sessions[sessionId] = session;
  
  securityLogger.logSecurityEvent(
    SecurityEventType.SESSION,
    'SUCCESS',
    { userId, sessionId, isAuthenticated },
    'LOW'
  );
  
  return session;
};

// Get session by ID
export const getSession = (sessionId: string): SessionInfo | null => {
  const session = sessions[sessionId];
  
  if (!session) {
    return null;
  }
  
  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    delete sessions[sessionId];
    return null;
  }
  
  // Extend session expiration
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  
  return session;
};

// Validate CSRF token
export const validateCsrfToken = (
  sessionId: string, 
  token: string
): boolean => {
  const session = getSession(sessionId);
  
  if (!session) {
    return false;
  }
  
  const isValid = session.csrfToken === token;
  
  if (!isValid) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CSRF,
      'FAILURE',
      { sessionId, userId: session.userId },
      'HIGH'
    );
  }
  
  return isValid;
};

// Invalidate session
export const invalidateSession = (sessionId: string): boolean => {
  if (sessions[sessionId]) {
    securityLogger.logSecurityEvent(
      SecurityEventType.SESSION,
      'SUCCESS',
      { sessionId, userId: sessions[sessionId].userId, action: 'Invalidate' },
      'LOW'
    );
    
    delete sessions[sessionId];
    return true;
  }
  return false;
};

// Get all user sessions
export const getUserSessions = (userId: string): SessionInfo[] => {
  return Object.values(sessions).filter(session => session.userId === userId);
};

// Store data in session
export const setSessionData = (sessionId: string, key: string, value: any): boolean => {
  const session = getSession(sessionId);
  
  if (!session) {
    return false;
  }
  
  session.data[key] = value;
  return true;
};

// Get data from session
export const getSessionData = (sessionId: string, key: string): any => {
  const session = getSession(sessionId);
  
  if (!session) {
    return null;
  }
  
  return session.data[key];
};
