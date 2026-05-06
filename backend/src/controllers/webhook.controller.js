import stripe from '../config/stripe.js';
import env from '../config/env.js';
import { findCartByUser, updateCartById } from '../repositories/cart.repository.js';
import { findOrderById, updateOrderById } from '../repositories/order.repository.js';
import {
  createPaymentLog,
  findPaymentLogByEventId,
} from '../repositories/paymentLog.repository.js';
import {
  queueOrderSuccessEmail,
  queuePaymentFailureEmail,
} from '../services/mail.service.js';
import { reduceInventoryForOrder } from '../services/orderLifecycle.service.js';

const getSessionCustomerEmail = (session) => {
  return (
    session.customer_details?.email ||
    session.customer_email ||
    session.receipt_email ||
    null
  );
};

const getPaymentIntentId = (session) => {
  if (!session.payment_intent) {
    return null;
  }

  if (typeof session.payment_intent === 'string') {
    return session.payment_intent;
  }

  return session.payment_intent.id || null;
};

const getChargeId = (session) => {
  const paymentIntent = session.payment_intent;

  if (!paymentIntent || typeof paymentIntent === 'string') {
    return session.charge || null;
  }

  const charges = paymentIntent.charges?.data || [];
  return charges[0]?.id || session.charge || null;
};

const buildPayloadSummary = (event) => {
  const object = event?.data?.object || {};

  return {
    eventId: event.id,
    eventType: event.type,
    objectId: object.id || null,
    objectType: object.object || null,
    orderId: object.metadata?.orderId || null,
    userId: object.metadata?.userId || null,
    paymentIntent: getPaymentIntentId(object),
    charge: getChargeId(object),
    customerEmail: getSessionCustomerEmail(object),
    amountTotal: object.amount_total || object.amount || null,
    currency: object.currency || null,
    paymentStatus: object.payment_status || object.status || null,
    status: object.status || null,
    metadata: object.metadata || {},
  };
};

const buildPaymentLogPayload = ({ event, status = 'success', error = null }) => {
  const object = event?.data?.object || {};
  const payloadSummary = buildPayloadSummary(event);

  return {
    provider: 'stripe',
    eventId: event.id,
    eventType: event.type,
    orderId: object.metadata?.orderId || null,
    paymentReference: object.id || null,
    paymentIntent: getPaymentIntentId(object),
    charge: getChargeId(object),
    customerEmail: getSessionCustomerEmail(object),
    amountTotal: object.amount_total || object.amount || null,
    currency: object.currency || null,
    paymentStatus: object.payment_status || object.status || null,
    processingStatus: status === 'failure' ? 'failed' : 'processed',
    status,
    payloadSummary,
    error,
  };
};

const clearCartForUser = async (userId) => {
  if (!userId) {
    return;
  }

  const cart = await findCartByUser(userId);

  if (!cart) {
    return;
  }

  await updateCartById(cart._id, {
    items: [],
    coupon: null,
    couponCodeSnapshot: '',
    subtotal: 0,
    discount: 0,
    shippingCharge: 0,
    total: 0,
  });
};

const handleCheckoutSessionCompleted = async (event) => {
  const session = event.data.object;
  const orderId = session.metadata?.orderId || null;
  const userId = session.metadata?.userId || null;

  const order = orderId ? await findOrderById(orderId) : null;

  if (order && order.paymentStatus !== 'paid') {
    await reduceInventoryForOrder(order);

    await updateOrderById(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      paymentReference: session.id,
      paidAt: new Date(),
    });

    await clearCartForUser(userId || order.user);
  }

  await createPaymentLog(buildPaymentLogPayload({ event }));

  const userEmail = getSessionCustomerEmail(session);

  if (order && userEmail) {
    await queueOrderSuccessEmail({
      to: userEmail,
      orderNumber: order.orderNumber,
    });
  }
};

const handleCheckoutSessionExpired = async (event) => {
  const session = event.data.object;
  const orderId = session.metadata?.orderId || null;

  const order = orderId ? await findOrderById(orderId) : null;

  if (order && order.paymentStatus !== 'paid') {
    await updateOrderById(orderId, {
      paymentStatus: 'failed',
      orderStatus: 'failed',
      paymentReference: session.id,
    });
  }

  await createPaymentLog(buildPaymentLogPayload({ event }));

  const userEmail = getSessionCustomerEmail(session);

  if (order && userEmail) {
    await queuePaymentFailureEmail({
      to: userEmail,
      orderNumber: order.orderNumber,
    });
  }
};

const stripeWebhookController = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const existingLog = await findPaymentLogByEventId(event.id);

  if (existingLog) {
    return res.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event);
      return res.json({ received: true });
    }

    if (event.type === 'checkout.session.expired') {
      await handleCheckoutSessionExpired(event);
      return res.json({ received: true });
    }

    await createPaymentLog(buildPaymentLogPayload({ event }));
    return res.json({ received: true });
  } catch (error) {
    await createPaymentLog(
      buildPaymentLogPayload({
        event,
        status: 'failure',
        error: error.message,
      })
    );

    return res.status(500).send('Webhook processing failed');
  }
};

export { stripeWebhookController };