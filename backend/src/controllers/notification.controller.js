import {
  getNotificationLogsByOrderService,
  listNotificationLogsService,
  resendNotificationService,
} from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccessResponse } from '../utils/response.js';

const listNotificationLogsController = asyncHandler(async (req, res) => {
  const data = await listNotificationLogsService(req.query);

  return sendSuccessResponse(res, {
    message: 'Notification logs fetched successfully',
    data,
  });
});

const getNotificationLogsByOrderController = asyncHandler(async (req, res) => {
  const data = await getNotificationLogsByOrderService(req.params.orderId);

  return sendSuccessResponse(res, {
    message: 'Order notification logs fetched successfully',
    data,
  });
});

const resendNotificationController = asyncHandler(async (req, res) => {
  const data = await resendNotificationService(req.params.notificationLogId);

  return sendSuccessResponse(res, {
    message: 'Notification queued successfully',
    data,
  });
});

export {
  listNotificationLogsController,
  getNotificationLogsByOrderController,
  resendNotificationController,
};