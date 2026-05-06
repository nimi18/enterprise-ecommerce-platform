import {
  deleteEmptyCartsOlderThan,
  deleteExpiredCarts,
} from '../repositories/cart.repository.js';
import {
  expirePendingOrdersOlderThan,
  findPendingOrdersOlderThan,
  updateOrderById,
} from '../repositories/order.repository.js';
import { createPaymentLog } from '../repositories/paymentLog.repository.js';

const minutesAgo = (minutes) => {
  return new Date(Date.now() - minutes * 60 * 1000);
};

const daysAgo = (days) => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const expireOldPendingOrdersService = async ({ olderThanMinutes = 30 } = {}) => {
  const cutoffDate = minutesAgo(olderThanMinutes);

  const pendingOrders = await findPendingOrdersOlderThan(cutoffDate);

  if (!pendingOrders.length) {
    return {
      matched: 0,
      modified: 0,
    };
  }

  const result = await expirePendingOrdersOlderThan(cutoffDate);

  return {
    matched: result.matchedCount ?? result.n ?? pendingOrders.length,
    modified: result.modifiedCount ?? result.nModified ?? 0,
  };
};

const cleanupOldCartsService = async ({
  emptyCartOlderThanDays = 7,
} = {}) => {
  const emptyCartCutoff = daysAgo(emptyCartOlderThanDays);

  const [emptyCartResult, expiredCartResult] = await Promise.all([
    deleteEmptyCartsOlderThan(emptyCartCutoff),
    deleteExpiredCarts(new Date()),
  ]);

  return {
    emptyCartsDeleted:
      emptyCartResult.deletedCount ?? emptyCartResult.n ?? 0,
    expiredCartsDeleted:
      expiredCartResult.deletedCount ?? expiredCartResult.n ?? 0,
  };
};

const reconcilePaidOrderService = async ({
  orderId,
  paymentReference,
  paymentIntent = null,
  charge = null,
  customerEmail = null,
  amountTotal = null,
  currency = null,
  eventId,
  eventType = 'manual.reconciliation',
} = {}) => {
  const updatedOrder = await updateOrderById(orderId, {
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    paymentReference,
    paidAt: new Date(),
  });

  await createPaymentLog({
    provider: 'stripe',
    eventId,
    eventType,
    orderId,
    paymentReference,
    paymentIntent,
    charge,
    customerEmail,
    amountTotal,
    currency,
    paymentStatus: 'paid',
    processingStatus: 'processed',
    status: 'success',
    payloadSummary: {
      orderId,
      paymentReference,
      paymentIntent,
      charge,
      customerEmail,
      amountTotal,
      currency,
      source: 'manual_reconciliation',
    },
  });

  return updatedOrder;
};

export {
  expireOldPendingOrdersService,
  cleanupOldCartsService,
  reconcilePaidOrderService,
};