import { login, signup, getCurrentUser } from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const signupController = asyncHandler(async (req, res) => {
  const data = await signup(req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data,
  });
});

const loginController = asyncHandler(async (req, res) => {
  const data = await login(req.body);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'User logged in successfully',
    data,
  });
});

const getMeController = asyncHandler(async (req, res) => {
  const data = await getCurrentUser(req.user.userId);

  return sendSuccessResponse(res, {
    statusCode: 200,
    message: 'User fetched successfully',
    data,
  });
});

export { signupController, loginController, getMeController };