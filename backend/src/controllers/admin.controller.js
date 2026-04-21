import {
  getAllOrdersService,
  getAnyOrderByIdService,
  updateOrderStatusService,
} from '../services/admin.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const getAllOrdersController = asyncHandler(async (req, res) => {
  const data = await getAllOrdersService();

  return sendSuccessResponse(res, {
    message: 'All orders fetched successfully',
    data,
  });
});

const getAnyOrderByIdController = asyncHandler(async (req, res) => {
  const data = await getAnyOrderByIdService(req.params.orderId);

  return sendSuccessResponse(res, {
    message: 'Order fetched successfully',
    data,
  });
});

const updateOrderStatusController = asyncHandler(async (req, res) => {
  const data = await updateOrderStatusService(req.params.orderId, req.body);

  return sendSuccessResponse(res, {
    message: 'Order status updated successfully',
    data,
  });
});

export {
  getAllOrdersController,
  getAnyOrderByIdController,
  updateOrderStatusController,
};