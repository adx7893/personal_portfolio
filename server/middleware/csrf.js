import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

// In-memory store for CSRF tokens (use Redis for production)
// Format: { token: { userId, expiresAt } }
const csrfTokens = new Map();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Generate a CSRF token for a user
 * @param {string} userId - The user ID
 * @returns {string} The CSRF token
 */
export const generateCsrfToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (env.CSRF_TOKEN_EXPIRY_MS || 24 * 60 * 60 * 1000); // Default 24 hours
  
  csrfTokens.set(token, { userId, expiresAt });
  
  return token;
};

/**
 * Validate a CSRF token
 * @param {string} token - The CSRF token to validate
 * @param {string} userId - The user ID (optional, for additional validation)
 * @returns {boolean} True if valid, false otherwise
 */
export const validateCsrfToken = (token, userId) => {
  if (!token) return false;
  
  const tokenData = csrfTokens.get(token);
  
  if (!tokenData) return false;
  
  // Check if expired
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }
  
  // If userId provided, verify it matches
  if (userId && tokenData.userId !== userId) {
    return false;
  }
  
  return true;
};

/**
 * Remove a CSRF token (for logout)
 * @param {string} token - The CSRF token to remove
 */
export const removeCsrfToken = (token) => {
  csrfTokens.delete(token);
};

/**
 * CSRF middleware for protected routes
 * Validates CSRF token in request headers
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests (safe methods)
  if (req.method === 'GET') {
    return next();
  }
  
  // Skip for routes that don't require CSRF protection
  const skipCsrfRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/register'];
  if (skipCsrfRoutes.includes(req.path)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!csrfToken) {
    return next(new ApiError(403, 'CSRF token is required.'));
  }
  
  const userId = req.user?.id;
  
  if (!validateCsrfToken(csrfToken, userId)) {
    return next(new ApiError(403, 'Invalid or expired CSRF token.'));
  }
  
  // Regenerate token on each mutation for rotation
  if (userId) {
    removeCsrfToken(csrfToken);
    req.newCsrfToken = generateCsrfToken(userId);
  }
  
  next();
};

/**
 * Middleware to add CSRF token to response locals
 * Use this for routes that need to provide CSRF token to frontend
 */
export const csrfTokenMiddleware = (req, res, next) => {
  if (req.user?.id) {
    // Generate or get existing token for authenticated users
    const existingToken = Array.from(csrfTokens.entries())
      .find(([_, data]) => data.userId === req.user.id)?.[0];
    
    res.locals.csrfToken = existingToken || generateCsrfToken(req.user.id);
  }
  next();
};
