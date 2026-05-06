import crypto from 'crypto';
import { comparePassword, hashPassword } from '../utils/password.js';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  findUserById,
  findUserWithPasswordById,
  updateUserById,
} from '../repositories/user.repository.js';
import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from './storage.service.js';
import AppError from '../utils/appError.js';

const getMyProfileService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return user;
};

const updateMyProfileService = async (userId, payload) => {
  const updatePayload = {};

  if (typeof payload.name !== 'undefined') {
    updatePayload.name = payload.name;
  }

  if (typeof payload.phone !== 'undefined') {
    updatePayload.phone = payload.phone || null;
  }

  const user = await updateUserById(userId, updatePayload);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return user;
};

const changeMyPasswordService = async (userId, payload) => {
  const user = await findUserWithPasswordById(userId);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const isCurrentPasswordValid = await comparePassword(
    payload.currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new AppError(
      'Current password is incorrect',
      400,
      ERROR_CODES.BAD_REQUEST
    );
  }

  const hashedPassword = await hashPassword(payload.newPassword);

  await updateUserById(userId, {
    password: hashedPassword,
  });

  return true;
};

const updateMyAvatarService = async (userId, file) => {
  if (!file) {
    throw new AppError('Avatar file is required', 400, ERROR_CODES.BAD_REQUEST);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const publicId = crypto.randomUUID();
  const uploadResult = await uploadBufferToCloudinary({
    buffer: file.buffer,
    folder: `enterprise-ecommerce-platform/avatars/${userId}`,
    publicId,
  });

  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  return updateUserById(userId, {
    avatarUrl: uploadResult.url,
    avatarPublicId: uploadResult.publicId,
  });
};

const deleteMyAvatarService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId);
  }

  return updateUserById(userId, {
    avatarUrl: null,
    avatarPublicId: null,
  });
};

export {
  getMyProfileService,
  updateMyProfileService,
  changeMyPasswordService,
  updateMyAvatarService,
  deleteMyAvatarService,
};