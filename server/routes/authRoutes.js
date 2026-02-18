import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getUserById } from '../services/authService.js';
import { login, signup } from '../controllers/authController.js';
import { createRateLimitMiddleware } from '../config/rateLimit.js';
import { revokeToken } from '../services/tokenBlacklistService.js';

const router = express.Router();
const authRateLimit = createRateLimitMiddleware({
  keyPrefix: 'auth',
  maxRequests: 15,
  windowMs: 60_000,
});

router.post('/auth/signup', authRateLimit, asyncHandler(signup));
router.post('/auth/register', authRateLimit, asyncHandler(signup));
router.post('/auth/login', authRateLimit, asyncHandler(login));

router.post(
  '/auth/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    revokeToken(req.authToken, req.authPayload?.exp);
    res.status(200).json({ success: true, data: { loggedOut: true } });
  })
);

router.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, data: user });
  })
);

export { router as authRoutes };
