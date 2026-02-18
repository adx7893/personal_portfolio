import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-local-jwt-secret-change-in-production',
  JWT_EXPIRES_IN_SEC: Number(process.env.JWT_EXPIRES_IN_SEC || 60 * 60 * 24 * 7),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 5),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20),
  COVER_LETTER_RATE_LIMIT_WINDOW_MS: Number(process.env.COVER_LETTER_RATE_LIMIT_WINDOW_MS || 60_000),
  COVER_LETTER_RATE_LIMIT_MAX_REQUESTS: Number(process.env.COVER_LETTER_RATE_LIMIT_MAX_REQUESTS || 5),
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'myapp',
};
