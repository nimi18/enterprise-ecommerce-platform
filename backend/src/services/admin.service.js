import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  countAdminOrders,
  findAdminOrders,
  findAllOrders,
  findOrderById,
  updateOrderById,
} from '../repositories/order.repository.js';
import { createNotificationLog } from '../repositories/notificationLog.repository.js';
import { cancelOrderService } from './orderLifecycle.service.js';
import AppError from '../utils/appError.js';

const buildAdminOrderFilter = (query = {}) => {
  const filter = {};

  if (query.orderStatus) {
    filter.orderStatus = query.orderStatus;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.userId) {
    if (!mongoose.Types.ObjectId.isValid(query.userId)) {
      throw new AppError('Invalid user id', 400, ERROR_CODES.BAD_REQUEST);
    }

    filter.user = query.userId;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');

    filter.$or = [
      { orderNumber: searchRegex },
      { paymentReference: searchRegex },
      { trackingNumber: searchRegex },
    ];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};

    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  return filter;
};

const getAllOrdersService = async (query = {}) => {
  const hasQueryParams = Object.keys(query).length > 0;

  if (!hasQueryParams) {
    return findAllOrders();
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const filter = buildAdminOrderFilter(query);

  const sort = {
    [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1,
  };

  const [items, total] = await Promise.all([
    findAdminOrders({
      filter,
      sort,
      skip,
      limit,
    }),
    countAdminOrders(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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

const adminCancelOrderService = async (orderId, payload = {}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const order = await findOrderById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const cancelledOrder = await cancelOrderService({
    order,
    actor: 'admin',
    reason: payload.reason || null,
  });

  await createOrderStatusNotificationLog(cancelledOrder, 'cancelled');

  return cancelledOrder;
};

export {
  getAllOrdersService,
  getAnyOrderByIdService,
  updateOrderStatusService,
  adminCancelOrderService,
};