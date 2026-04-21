import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  findOrderById,
  findOrdersByUser,
} from '../repositories/order.repository.js';
import AppError from '../utils/appError.js';

const getMyOrdersService = async (userId) => {
  return findOrdersByUser(userId);
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

export { getMyOrdersService, getOrderByIdService };