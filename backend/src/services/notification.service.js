import mongoose from 'mongoose';
import ERROR_CODES from '../constants/errorCodes.js';
import {
  countNotificationLogs,
  findNotificationLogById,
  findNotificationLogs,
  findNotificationLogsByOrder,
  updateNotificationLogById,
} from '../repositories/notificationLog.repository.js';
import { findOrderById } from '../repositories/order.repository.js';
import { queueOrderSuccessEmail, queuePaymentFailureEmail } from './mail.service.js';
import AppError from '../utils/appError.js';

const buildNotificationFilter = (query = {}) => {
  const filter = {};

  if (query.orderId) {
    if (!mongoose.Types.ObjectId.isValid(query.orderId)) {
      throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
    }

    filter.order = query.orderId;
  }

  if (query.userId) {
    if (!mongoose.Types.ObjectId.isValid(query.userId)) {
      throw new AppError('Invalid user id', 400, ERROR_CODES.BAD_REQUEST);
    }

    filter.user = query.userId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.channel) {
    filter.channel = query.channel;
  }

  return filter;
};

const listNotificationLogsService = async (query = {}) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const filter = buildNotificationFilter(query);
  const sort = {
    [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1,
  };

  const [items, total] = await Promise.all([
    findNotificationLogs({
      filter,
      sort,
      skip,
      limit,
    }),
    countNotificationLogs(filter),
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

const getNotificationLogsByOrderService = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new AppError('Invalid order id', 400, ERROR_CODES.BAD_REQUEST);
  }

  return findNotificationLogsByOrder(orderId);
};

const resolveNotificationEmail = (notificationLog, order) => {
  return (
    notificationLog.payloadSummary?.customerEmail ||
    notificationLog.payloadSummary?.email ||
    notificationLog.payloadSummary?.to ||
    order?.customerEmail ||
    null
  );
};

const resendNotificationService = async (notificationLogId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationLogId)) {
    throw new AppError('Invalid notification log id', 400, ERROR_CODES.BAD_REQUEST);
  }

  const notificationLog = await findNotificationLogById(notificationLogId);

  if (!notificationLog) {
    throw new AppError('Notification log not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (notificationLog.channel !== 'email') {
    throw new AppError(
      'Only email notifications can be resent',
      400,
      ERROR_CODES.BAD_REQUEST
    );
  }

  const order = notificationLog.order
    ? await findOrderById(notificationLog.order)
    : null;

  const to = resolveNotificationEmail(notificationLog, order);

  if (!to) {
    throw new AppError(
      'Recipient email not available for this notification',
      400,
      ERROR_CODES.BAD_REQUEST
    );
  }

  const orderNumber =
    notificationLog.payloadSummary?.orderNumber ||
    order?.orderNumber ||
    'your order';

  if (
    notificationLog.type === 'payment_failed' ||
    notificationLog.templateName === 'payment-failure'
  ) {
    await queuePaymentFailureEmail({
      to,
      orderNumber,
    });
  } else {
    await queueOrderSuccessEmail({
      to,
      orderNumber,
    });
  }

  const updatedLog = await updateNotificationLogById(notificationLogId, {
    status: 'queued',
    failureReason: null,
    payloadSummary: {
      ...(notificationLog.payloadSummary || {}),
      resentAt: new Date(),
      resentTo: to,
    },
  });

  return updatedLog;
};

export {
  listNotificationLogsService,
  getNotificationLogsByOrderService,
  resendNotificationService,
};