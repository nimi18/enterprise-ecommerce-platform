import { checkoutService } from '../services/checkout.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const checkoutController = asyncHandler(async (req, res) => {
  const data = await checkoutService(req.user.userId, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: 'Order created successfully',
    data,
  });
});

export { checkoutController };