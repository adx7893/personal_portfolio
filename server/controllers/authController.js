import { z } from 'zod';
import { registerUser, loginUser } from '../services/authService.js';
import { ApiError } from '../utils/errors.js';

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  firstname: z.string().trim().min(1).max(80).optional(),
  lastname: z.string().trim().min(1).max(80).optional(),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please provide a valid email address.' }),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters.' })
    .max(120),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please provide a valid email address.' }),
  password: z.string({ required_error: 'Password is required.' }).min(1).max(120),
});

const parseBody = (schema, body) => {
  const parsed = schema.safeParse(body || {});
  if (!parsed.success) {
    const first = parsed.error.issues?.[0]?.message || 'Invalid request body.';
    throw new ApiError(400, first);
  }
  return parsed.data;
};

export const signup = async (req, res) => {
  const body = parseBody(signupSchema, req.body);
  const data = await registerUser(body);
  res.status(201).json({ success: true, data });
};

export const login = async (req, res) => {
  const body = parseBody(loginSchema, req.body);
  const data = await loginUser(body);
  res.status(200).json({ success: true, data });
};
