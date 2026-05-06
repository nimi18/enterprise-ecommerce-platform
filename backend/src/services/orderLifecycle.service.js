import AppError from '../utils/appError.js';
import ERROR_CODES from '../constants/errorCodes.js';
import { updateOrderById } from '../repositories/order.repository.js';
import {
  decrementProductStock,
  incrementProductStock,
} from '../repositories/product.repository.js';

const normalizeProductId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const reduceInventoryForOrder = async (order) => {
  if (!order?.items?.length) {
    return;
  }

  for (const item of order.items) {
    const productId = normalizeProductId(item.product);

    if (!productId) {
      throw new AppError(
        'Invalid order item product',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }

    const updatedProduct = await decrementProductStock({
      productId,
      quantity: item.quantity,
    });

    if (!updatedProduct) {
      throw new AppError(
        `Insufficient stock for ${item.titleSnapshot}`,
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }
  }
};

const restoreInventoryForOrder = async (order) => {
  if (!order?.items?.length) {
    return;
  }

  for (const item of order.items) {
    const productId = normalizeProductId(item.product);

    if (!productId) {
      continue;
    }

    await incrementProductStock({
      productId,
      quantity: item.quantity,
    });
  }
};

const cancelOrderService = async ({
  order,
  actor = 'customer',
  reason = null,
} = {}) => {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];

  if (!order) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!cancellableStatuses.includes(order.orderStatus)) {
    throw new AppError(
      'Order cannot be cancelled at this stage',
      400,
      ERROR_CODES.BAD_REQUEST
    );
  }

  if (order.paymentStatus === 'paid') {
    await restoreInventoryForOrder(order);
  }

  return updateOrderById(order._id, {
    orderStatus: 'cancelled',
    paymentStatus:
      order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
    cancelledBy: actor,
    cancelledAt: new Date(),
    cancellationReason: reason,
  });
};

export {
  reduceInventoryForOrder,
  restoreInventoryForOrder,
  cancelOrderService,
};