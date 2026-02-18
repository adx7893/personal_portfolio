import express from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError } from '../utils/errors.js';
import {
  changeUserPassword,
  getUserById,
  updateUserProfile,
} from '../services/authService.js';

const router = express.Router();

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  profilePicture: z.string().trim().max(500).optional(),
  resumeFile: z.string().trim().max(500).optional(),
  preferences: z
    .object({
      preferredLocation: z.string().trim().max(120).optional(),
      remoteOnly: z.boolean().optional(),
      roleCategory: z.string().trim().max(120).optional(),
    })
    .optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(120),
  newPassword: z.string().min(6).max(120),
});

const parseBody = (schema, body) => {
  const parsed = schema.safeParse(body || {});
  if (!parsed.success) {
    const first = parsed.error.issues?.[0]?.message || 'Invalid request body.';
    throw new ApiError(400, first);
  }
  return parsed.data;
};

router.get(
  '/user/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found.');
    res.status(200).json({ success: true, data: user });
  })
);

router.put(
  '/user/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseBody(profileSchema, req.body);
    const user = await updateUserProfile(req.user.id, body);
    res.status(200).json({ success: true, data: user });
  })
);

router.put(
  '/user/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = parseBody(passwordSchema, req.body);
    const result = await changeUserPassword({
      userId: req.user.id,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    res.status(200).json({ success: true, data: result });
  })
);

export { router as userRoutes };
