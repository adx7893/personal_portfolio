import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from './errors.js';

const encodeBase64Url = (value) => Buffer.from(value, 'utf-8').toString('base64url');

/**
 * Generate a unique token ID
 * @returns {string} Unique token ID
 */
export const generateTokenId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Sign a JWT access token
 * @param {object} payload - Token payload
 * @param {number} expiresInSec - Token expiration in seconds
 * @returns {object} Object containing token and tokenId
 */
export const signAccessToken = (payload, expiresInSec = env.JWT_EXPIRES_IN_SEC) => {
  if (!env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured.');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const tokenId = generateTokenId();
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const tokenPayload = { 
    ...payload, 
    iat: nowSec, 
    exp: nowSec + expiresInSec,
    jti: tokenId, // JWT ID for token revocation
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(data)
    .digest('base64url');

  return {
    token: `${data}.${signature}`,
    tokenId,
    expiresAt: tokenPayload.exp,
  };
};

/**
 * Sign a JWT refresh token (longer expiration)
 * @param {object} payload - Token payload
 * @param {number} expiresInSec - Token expiration in seconds (default 30 days)
 * @returns {object} Object containing token and tokenId
 */
export const signRefreshToken = (payload, expiresInSec = 60 * 60 * 24 * 30) => {
  if (!env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured.');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const tokenId = generateTokenId();
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const tokenPayload = { 
    ...payload, 
    iat: nowSec, 
    exp: nowSec + expiresInSec,
    jti: tokenId,
    type: 'refresh', // Token type identifier
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(data)
    .digest('base64url');

  return {
    token: `${data}.${signature}`,
    tokenId,
    expiresAt: tokenPayload.exp,
  };
};

/**
 * Sign a JWT token (legacy function for backward compatibility)
 * @param {object} payload - Token payload
 * @param {number} expiresInSec - Token expiration in seconds
 * @returns {string} JWT token string
 */
export const signJwt = (payload, expiresInSec = env.JWT_EXPIRES_IN_SEC) => {
  const result = signAccessToken(payload, expiresInSec);
  return result.token;
};
