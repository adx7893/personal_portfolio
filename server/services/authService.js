import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

const toPublicUser = (userDoc) => {
  if (!userDoc) return null;
  const firstName = String(userDoc.firstName || userDoc.firstname || '').trim();
  const lastName = String(userDoc.lastName || userDoc.lastname || '').trim();
  const name = `${firstName} ${lastName}`.trim();

  return {
    id: userDoc._id.toString(),
    name,
    firstName,
    lastName,
    fullName: name,
    email: userDoc.email,
    role: 'user',
    profilePicture: '',
    resumeFile: '',
    preferences: {},
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt || userDoc.createdAt,
  };
};

const signAuthToken = (userId, email) => {
  if (!env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured.');
  }
  return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '7d' });
};

const ensureUserDocumentComplete = async (userDoc) => {
  if (!userDoc) return null;

  const derivedFirstName = String(userDoc.firstName || userDoc.firstname || '').trim();
  const derivedLastName = String(userDoc.lastName || userDoc.lastname || '').trim();
  const derivedEmail = String(userDoc.email || '').trim().toLowerCase();
  const hasPassword = typeof userDoc.password === 'string' && userDoc.password.length > 0;

  const patch = {};
  if (userDoc.firstName === undefined) patch.firstName = derivedFirstName;
  if (userDoc.lastName === undefined) patch.lastName = derivedLastName;
  if (userDoc.email === undefined) patch.email = derivedEmail;
  if (!hasPassword) {
    patch.password = await bcrypt.hash('', SALT_ROUNDS);
  }

  if (Object.keys(patch).length > 0) {
    await User.updateOne({ _id: userDoc._id }, { $set: patch });
    Object.assign(userDoc, patch);
  }

  return userDoc;
};

const normalizeNameInput = ({ firstName, lastName, firstname, lastname, name }) => {
  const safeFirst = String(firstName || firstname || '').trim();
  const safeLast = String(lastName || lastname || '').trim();
  if (safeFirst || safeLast) {
    return { firstName: safeFirst, lastName: safeLast };
  }

  const safeName = String(name || '').trim();
  if (!safeName) {
    return { firstName: '', lastName: '' };
  }

  const parts = safeName.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

export const registerUser = async ({ firstName, lastName, firstname, lastname, name, email, password }) => {
  const names = normalizeNameInput({ firstName, lastName, firstname, lastname, name });
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '');

  if (!names.firstName || !names.lastName || !safeEmail || !safePassword) {
    throw new ApiError(400, 'First name, last name, email, and password are required.');
  }
  if (safePassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const existing = await User.findOne({ email: safeEmail });
  if (existing) {
    await ensureUserDocumentComplete(existing);
    throw new ApiError(400, 'An account with this email already exists.');
  }

  const user = await User.create({
    firstName: names.firstName,
    lastName: names.lastName,
    email: safeEmail,
    password: safePassword,
  });

  await ensureUserDocumentComplete(user);
  const token = signAuthToken(user._id.toString(), user.email);
  return { user: toPublicUser(user), token };
};

export const loginUser = async ({ email, password }) => {
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePassword = String(password || '');

  if (!safeEmail || !safePassword) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: safeEmail });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  await ensureUserDocumentComplete(user);

  const isMatch = await user.comparePassword(safePassword);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signAuthToken(user._id.toString(), user.email);
  return { user: toPublicUser(user), token };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  await ensureUserDocumentComplete(user);
  return toPublicUser(user);
};

export const updateUserProfile = async (userId, updates) => {
  const patch = {};
  const nextFirst = String(updates?.firstName || updates?.firstname || '').trim();
  const nextLast = String(updates?.lastName || updates?.lastname || '').trim();
  if (nextFirst) patch.firstName = nextFirst;
  if (nextLast) patch.lastName = nextLast;

  if (Object.keys(patch).length === 0) {
    const existing = await User.findById(userId);
    if (!existing) throw new ApiError(404, 'User not found.');
    await ensureUserDocumentComplete(existing);
    return toPublicUser(existing);
  }

  const user = await User.findByIdAndUpdate(userId, patch, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found.');
  await ensureUserDocumentComplete(user);
  return toPublicUser(user);
};

export const changeUserPassword = async ({ userId, currentPassword, newPassword }) => {
  const safeCurrentPassword = String(currentPassword || '');
  const safeNewPassword = String(newPassword || '');

  if (!safeCurrentPassword || !safeNewPassword) {
    throw new ApiError(400, 'Current password and new password are required.');
  }
  if (safeNewPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found.');
  await ensureUserDocumentComplete(user);

  const matches = await user.comparePassword(safeCurrentPassword);
  if (!matches) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = safeNewPassword;
  await user.save();

  return { success: true };
};
