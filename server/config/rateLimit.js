import { env } from './env.js';

// Lightweight placeholder rate limiter.
// Swap this with Redis-backed limiting for multi-instance production deployment.
export const createRateLimitMiddleware = (options = {}) => {
  const requests = new Map();
  const windowMs = Number(options.windowMs || env.RATE_LIMIT_WINDOW_MS);
  const maxRequests = Number(options.maxRequests || env.RATE_LIMIT_MAX_REQUESTS);
  const keyPrefix = options.keyPrefix || 'global';

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const history = requests.get(key) || [];
    const recent = history.filter((timestamp) => timestamp > windowStart);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again shortly.',
      });
    }

    recent.push(now);
    requests.set(key, recent);
    return next();
  };
};
