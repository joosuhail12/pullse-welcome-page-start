
/**
 * Environment-aware structured logging utility
 * Provides consistent logging with environment-specific behavior
 */

// Log levels in order of increasing severity
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  SILENT = 5
}

// Configuration for different environments
const LOG_LEVEL_CONFIG = {
  development: LogLevel.TRACE, // Show all logs in development
  test: LogLevel.DEBUG,        // Show debug and higher in test
  production: LogLevel.INFO    // Only show info and higher in production
};

// Get current environment or default to 'development'
const getEnvironment = (): 'development' | 'test' | 'production' => {
  // Check for Vite's import.meta.env
  if (import.meta.env) {
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.MODE === 'test') return 'test';
  }
  
  // Fallback environment detection
  if (process.env.NODE_ENV) {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.NODE_ENV === 'test') return 'test';
  }
  
  // Default to development for safety
  return 'development';
};

// Get configured minimum log level based on environment
const getCurrentLogLevel = (): LogLevel => {
  const env = getEnvironment();
  return LOG_LEVEL_CONFIG[env];
};

// Structured log entry type
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  module?: string;
  details?: any;
}

// Format a log entry to a string
const formatLogEntry = (entry: LogEntry): string => {
  let formatted = `${entry.timestamp} ${entry.level}: ${entry.message}`;
  
  if (entry.module) {
    formatted = `${formatted} [${entry.module}]`;
  }
  
  return formatted;
};

// Safe stringification of objects for logging
const safeStringify = (obj: any): string => {
  try {
    return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
  } catch (err) {
    return '[Object cannot be stringified]';
  }
};

// Core logging function
const logWithLevel = (
  level: LogLevel, 
  message: string,
  moduleOrDetails?: string | any,
  details?: any
): void => {
  // Check if this log should be shown in current environment
  if (level < getCurrentLogLevel()) {
    return; // Skip logging if below configured level
  }
  
  const timestamp = new Date().toISOString();
  let moduleStr: string | undefined;
  let detailsObj: any | undefined;
  
  // Handle flexible parameter order
  if (typeof moduleOrDetails === 'string') {
    moduleStr = moduleOrDetails;
    detailsObj = details;
  } else {
    detailsObj = moduleOrDetails;
  }

  // Create structured log entry
  const entry: LogEntry = {
    timestamp,
    level: LogLevel[level],
    message,
    ...(moduleStr && { module: moduleStr }),
    ...(detailsObj !== undefined && { details: detailsObj })
  };

  // Select appropriate console method
  switch (level) {
    case LogLevel.TRACE:
    case LogLevel.DEBUG:
      console.debug(formatLogEntry(entry));
      break;
    case LogLevel.INFO:
      console.info(formatLogEntry(entry));
      break;
    case LogLevel.WARN:
      console.warn(formatLogEntry(entry));
      break;
    case LogLevel.ERROR:
      console.error(formatLogEntry(entry));
      break;
  }
  
  // In development, output detailed object if available
  if (getEnvironment() === 'development' && detailsObj !== undefined) {
    if (level >= LogLevel.ERROR) {
      console.error(detailsObj);
    } else {
      console.debug(detailsObj);
    }
  }
};

// Public API
export const logger = {
  trace: (message: string, moduleOrDetails?: string | any, details?: any) => 
    logWithLevel(LogLevel.TRACE, message, moduleOrDetails, details),
    
  debug: (message: string, moduleOrDetails?: string | any, details?: any) => 
    logWithLevel(LogLevel.DEBUG, message, moduleOrDetails, details),
    
  info: (message: string, moduleOrDetails?: string | any, details?: any) => 
    logWithLevel(LogLevel.INFO, message, moduleOrDetails, details),
    
  warn: (message: string, moduleOrDetails?: string | any, details?: any) => 
    logWithLevel(LogLevel.WARN, message, moduleOrDetails, details),
    
  error: (message: string, moduleOrDetails?: string | any, details?: any) => 
    logWithLevel(LogLevel.ERROR, message, moduleOrDetails, details),
    
  // Helper method to group logs for related operations
  group: (groupName: string, fn: () => void, collapsed = false) => {
    if (getEnvironment() === 'development') {
      if (collapsed) {
        console.groupCollapsed(groupName);
      } else {
        console.group(groupName);
      }
      
      fn();
      console.groupEnd();
    } else {
      // In production, just run the function without grouping
      fn();
    }
  }
};

