import { createCheckoutSessionService } from '../services/payment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const createCheckoutSessionController = asyncHandler(async (req, res) => {
  const data = await createCheckoutSessionService(
    req.user.userId,
    req.params.orderId
  );

  return sendSuccessResponse(res, {
    message: 'Checkout session created',
    data,
  });
});

export { createCheckoutSessionController };