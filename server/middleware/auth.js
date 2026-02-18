import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';
import { isTokenRevoked } from '../services/tokenBlacklistService.js';

const parseBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') return '';
  const [scheme, token] = authorizationHeader.split(' ');
  if (!/^Bearer$/i.test(scheme || '') || !token) return '';
  return token.trim();
};

export const requireAuth = (req, res, next) => {
  if (!env.JWT_SECRET) {
    return next(new ApiError(500, 'JWT_SECRET is not configured.'));
  }

  try {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) {
      throw new ApiError(401, 'Authorization bearer token is required.');
    }
    if (isTokenRevoked(token)) {
      throw new ApiError(401, 'Auth token has been revoked. Please log in again.');
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const userId = payload.userId || payload.sub || payload.id;
    if (!userId) {
      throw new ApiError(401, 'Auth token is missing user identity.');
    }

    req.user = {
      id: String(userId),
      email: typeof payload.email === 'string' ? payload.email : '',
      role: typeof payload.role === 'string' ? payload.role : 'user',
    };
    req.authToken = token;
    req.authPayload = payload;

    return next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Auth token has expired.'));
    }
    if (error?.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid auth token.'));
    }
    return next(error);
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role || 'user';
  if (!allowedRoles.includes(role)) {
    return next(new ApiError(403, 'Insufficient permissions.'));
  }
  return next();
};
