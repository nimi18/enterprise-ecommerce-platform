import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  countCustomerOrders,
  findCustomerOrders,
  findOrderById,
} from '../repositories/order.repository.js';
import { cancelOrderService } from './orderLifecycle.service.js';
import AppError from '../utils/appError.js';

const buildCustomerOrderFilter = (userId, query = {}) => {
  const filter = {
    user: userId,
  };

  if (query.orderStatus) {
    filter.orderStatus = query.orderStatus;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
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

const getMyOrdersService = async (userId, query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;

  const filter = buildCustomerOrderFilter(userId, query);

  const sort = {
    [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1,
  };

  const [items, total] = await Promise.all([
    findCustomerOrders({
      filter,
      sort,
      skip,
      limit,
    }),
    countCustomerOrders(filter),
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

const getOrderByIdService = async (userId, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const order = await findOrderById(orderId);

  if (!order || order.user.toString() !== userId) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return order;
};

const cancelMyOrderService = async (userId, orderId, payload = {}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const order = await findOrderById(orderId);

  if (!order || order.user.toString() !== userId) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return cancelOrderService({
    order,
    actor: 'customer',
    reason: payload.reason || null,
  });
};

export {
  getMyOrdersService,
  getOrderByIdService,
  cancelMyOrderService,
};