import {
  getMyOrdersService,
  getOrderByIdService,
} from '../services/order.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const getMyOrdersController = asyncHandler(async (req, res) => {
  const data = await getMyOrdersService(req.user.userId);

  return sendSuccessResponse(res, {
    message: 'Orders fetched successfully',
    data,
  });
});

const getOrderByIdController = asyncHandler(async (req, res) => {
  const data = await getOrderByIdService(
    req.user.userId,
    req.params.orderId
  );

  return sendSuccessResponse(res, {
    message: 'Order fetched successfully',
    data,
  });
});

export { getMyOrdersController, getOrderByIdController };