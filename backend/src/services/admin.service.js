import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  findAllOrders,
  findOrderById,
  updateOrderById,
} from '../repositories/order.repository.js';
import { createNotificationLog } from '../repositories/notificationLog.repository.js';
import AppError from '../utils/appError.js';

const getAllOrdersService = async () => {
  return findAllOrders();
};

const getAnyOrderByIdService = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const order = await findOrderById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return order;
};

const buildOrderStatusUpdatePayload = (existingOrder, payload) => {
  const updatePayload = {
    orderStatus: payload.orderStatus,
  };

  if (typeof payload.courierName !== 'undefined') {
    updatePayload.courierName = payload.courierName || null;
  }

  if (typeof payload.trackingNumber !== 'undefined') {
    updatePayload.trackingNumber = payload.trackingNumber || null;
  }

  if (typeof payload.trackingUrl !== 'undefined') {
    updatePayload.trackingUrl = payload.trackingUrl || null;
  }

  if (payload.orderStatus === 'shipped' && !existingOrder.shippedAt) {
    updatePayload.shippedAt = new Date();
  }

  if (payload.orderStatus === 'delivered' && !existingOrder.deliveredAt) {
    updatePayload.deliveredAt = new Date();
  }

  return updatePayload;
};

const createOrderStatusNotificationLog = async (order, orderStatus) => {
  const templateMap = {
    confirmed: 'order-confirmed',
    processing: 'order-processing',
    packed: 'order-packed',
    shipped: 'order-shipped',
    out_for_delivery: 'order-out-for-delivery',
    delivered: 'order-delivered',
    cancelled: 'order-cancelled',
    failed: 'order-failed',
    returned: 'order-returned',
  };

  const typeMap = {
    confirmed: 'order_confirmed',
    processing: 'order_processing',
    packed: 'order_packed',
    shipped: 'order_shipped',
    out_for_delivery: 'order_out_for_delivery',
    delivered: 'order_delivered',
    cancelled: 'order_cancelled',
    failed: 'order_failed',
    returned: 'order_returned',
  };

  if (!templateMap[orderStatus] || !typeMap[orderStatus]) {
    return null;
  }

  return createNotificationLog({
    user: order.user,
    order: order._id,
    type: typeMap[orderStatus],
    channel: 'system',
    templateName: templateMap[orderStatus],
    status: 'sent',
    payloadSummary: {
      orderNumber: order.orderNumber,
      orderStatus,
      trackingNumber: order.trackingNumber || null,
      courierName: order.courierName || null,
      trackingUrl: order.trackingUrl || null,
    },
  });
};

const updateOrderStatusService = async (orderId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const existingOrder = await findOrderById(orderId);

  if (!existingOrder) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const updatePayload = buildOrderStatusUpdatePayload(existingOrder, payload);

  const updatedOrder = await updateOrderById(orderId, updatePayload);

  await createOrderStatusNotificationLog(updatedOrder, payload.orderStatus);

  return updatedOrder;
};

export {
  getAllOrdersService,
  getAnyOrderByIdService,
  updateOrderStatusService,
};