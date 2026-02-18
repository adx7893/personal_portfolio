import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
};

// Security event types
export const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILED: 'SIGNUP_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_FAILED: 'PASSWORD_CHANGE_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  CSRF_VIOLATION: 'CSRF_VIOLATION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};

// Get log file path
const getLogFilePath = () => {
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const date = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `security-${date}.log`);
};

/**
 * Format log entry
 * @param {string} level - Log level
 * @param {string} event - Security event type
 * @param {object} data - Additional data to log
 * @returns {string} Formatted log entry
 */
const formatLogEntry = (level, event, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    event,
    ...data,
  };
  
  return JSON.stringify(logEntry);
};

/**
 * Write to log file
 * @param {string} entry - Formatted log entry
 */
const writeToLog = (entry) => {
  if (env.NODE_ENV === 'test') return; // Skip logging in test environment
  
  try {
    const logPath = getLogFilePath();
    fs.appendFileSync(logPath, entry + '\n');
  } catch (error) {
    console.error('Failed to write to security log:', error);
  }
};

/**
 * Log a security event
 * @param {string} event - Security event type
 * @param {object} data - Additional data to log
 */
export const logSecurityEvent = (event, data = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.SECURITY, event, data);
  writeToLog(entry);
  
  // Also log to console in development
  if (env.NODE_ENV !== 'production') {
    console.log(`[SECURITY] ${event}:`, data);
  }
};

/**
 * Log an info event
 * @param {string} message - Info message
 * @param {object} data - Additional data
 */
export const logInfo = (message, data = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.INFO, message, data);
  writeToLog(entry);
};

/**
 * Log a warning event
 * @param {string} message - Warning message
 * @param {object} data - Additional data
 */
export const logWarning = (message, data = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.WARNING, message, data);
  writeToLog(entry);
};

/**
 * Log an error event
 * @param {string} message - Error message
 * @param {object} data - Additional data
 */
export const logError = (message, data = {}) => {
  const entry = formatLogEntry(LOG_LEVELS.ERROR, message, data);
  writeToLog(entry);
};

/**
 * Log authentication success
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} ip - Client IP address
 */
export const logLoginSuccess = (userId, email, ip) => {
  logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, {
    userId,
    email: maskEmail(email),
    ip,
  });
};

/**
 * Log authentication failure
 * @param {string} email - User email (or unknown)
 * @param {string} ip - Client IP address
 * @param {string} reason - Failure reason
 */
export const logLoginFailed = (email, ip, reason) => {
  logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILED, {
    email: maskEmail(email),
    ip,
    reason,
  });
};

/**
 * Log account lockout
 * @param {string} email - User email
 * @param {string} ip - Client IP address
 * @param {number} failedAttempts - Number of failed attempts
 */
export const logAccountLocked = (email, ip, failedAttempts) => {
  logSecurityEvent(SECURITY_EVENTS.ACCOUNT_LOCKED, {
    email: maskEmail(email),
    ip,
    failedAttempts,
  });
};

/**
 * Log signup success
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} ip - Client IP address
 */
export const logSignupSuccess = (userId, email, ip) => {
  logSecurityEvent(SECURITY_EVENTS.SIGNUP_SUCCESS, {
    userId,
    email: maskEmail(email),
    ip,
  });
};

/**
 * Log signup failure
 * @param {string} email - User email
 * @param {string} ip - Client IP address
 * @param {string} reason - Failure reason
 */
export const logSignupFailed = (email, ip, reason) => {
  logSecurityEvent(SECURITY_EVENTS.SIGNUP_FAILED, {
    email: maskEmail(email),
    ip,
    reason,
  });
};

/**
 * Log token revocation (logout)
 * @param {string} userId - User ID
 * @param {string} ip - Client IP address
 */
export const logTokenRevoked = (userId, ip) => {
  logSecurityEvent(SECURITY_EVENTS.TOKEN_REVOKED, {
    userId,
    ip,
  });
};

/**
 * Log invalid token attempt
 * @param {string} ip - Client IP address
 * @param {string} reason - Reason for invalid token
 */
export const logInvalidToken = (ip, reason) => {
  logSecurityEvent(SECURITY_EVENTS.INVALID_TOKEN, {
    ip,
    reason,
  });
};

/**
 * Log CSRF violation
 * @param {string} ip - Client IP address
 * @param {string} path - Request path
 */
export const logCsrfViolation = (ip, path) => {
  logSecurityEvent(SECURITY_EVENTS.CSRF_VIOLATION, {
    ip,
    path,
  });
};

/**
 * Log rate limit exceeded
 * @param {string} ip - Client IP address
 * @param {string} endpoint - Endpoint that was rate limited
 */
export const logRateLimitExceeded = (ip, endpoint) => {
  logSecurityEvent(SECURITY_EVENTS.RATE_LIMIT_EXCEEDED, {
    ip,
    endpoint,
  });
};

/**
 * Mask email for privacy
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
const maskEmail = (email) => {
  if (!email) return 'unknown';
  
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '**';
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Get client IP from request
 * @param {object} req - Express request object
 * @returns {string} Client IP address
 */
export const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.headers['x-real-ip']
    || req.ip
    || 'unknown';
};
