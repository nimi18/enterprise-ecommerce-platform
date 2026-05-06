import {
  changeMyPasswordService,
  deleteMyAvatarService,
  getMyProfileService,
  updateMyAvatarService,
  updateMyProfileService,
} from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const getMyProfileController = asyncHandler(async (req, res) => {
  const data = await getMyProfileService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Profile fetched successfully',
    data,
  });
});

const updateMyProfileController = asyncHandler(async (req, res) => {
  const data = await updateMyProfileService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    message: 'Profile updated successfully',
    data,
  });
});

const changeMyPasswordController = asyncHandler(async (req, res) => {
  await changeMyPasswordService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    message: 'Password changed successfully',
    data: null,
  });
});

const updateMyAvatarController = asyncHandler(async (req, res) => {
  const data = await updateMyAvatarService(req.user.userId, req.file);

  return sendSuccessResponse(res, {
    message: 'Avatar updated successfully',
    data,
  });
});

const deleteMyAvatarController = asyncHandler(async (req, res) => {
  const data = await deleteMyAvatarService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Avatar removed successfully',
    data,
  });
});

export {
  getMyProfileController,
  updateMyProfileController,
  changeMyPasswordController,
  updateMyAvatarController,
  deleteMyAvatarController,
};