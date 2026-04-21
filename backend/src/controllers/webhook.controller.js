import stripe from '../config/stripe.js';
import env from '../config/env.js';
import { findOrderById, updateOrderById } from '../repositories/order.repository.js';
import {
  createPaymentLog,
  findPaymentLogByEventId,
} from '../repositories/paymentLog.repository.js';
import {
  queueOrderSuccessEmail,
  queuePaymentFailureEmail,
} from '../services/mail.service.js';

const buildPayloadSummary = (event) => {
  const object = event?.data?.object || {};

  return {
    eventId: event.id,
    eventType: event.type,
    objectId: object.id || null,
    objectType: object.object || null,
    paymentIntent: object.payment_intent || null,
    charge: object.charge || null,
    customerEmail:
      object.customer_details?.email ||
      object.customer_email ||
      object.receipt_email ||
      null,
    metadata: object.metadata || {},
    amountTotal: object.amount_total || null,
    currency: object.currency || null,
    paymentStatus: object.payment_status || null,
    status: object.status || null,
  };
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

  const eventType = event.type;
  const object = event.data.object;
  const payloadSummary = buildPayloadSummary(event);
  const orderIdFromMetadata = object?.metadata?.orderId || null;

  try {
    if (eventType === 'checkout.session.completed') {
      const orderId = orderIdFromMetadata;
      const paymentReference = object.id;

      const order = orderId ? await findOrderById(orderId) : null;

      if (order && order.paymentStatus !== 'paid') {
        await updateOrderById(orderId, {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          paymentReference,
          paidAt: new Date(),
        });
      }

      await createPaymentLog({
        provider: 'stripe',
        eventId: event.id,
        eventType,
        orderId,
        paymentReference,
        status: 'success',
        payloadSummary,
      });

      const userEmail =
        object.customer_details?.email ||
        object.customer_email ||
        null;

      if (order && userEmail) {
        await queueOrderSuccessEmail({
          to: userEmail,
          orderNumber: order.orderNumber,
        });
      }

      return res.json({ received: true });
    }

    if (eventType === 'checkout.session.expired') {
      const orderId = orderIdFromMetadata;
      const paymentReference = object.id;

      const order = orderId ? await findOrderById(orderId) : null;

      if (order && order.paymentStatus !== 'paid') {
        await updateOrderById(orderId, {
          paymentStatus: 'failed',
          orderStatus: 'failed',
          paymentReference,
        });
      }

      await createPaymentLog({
        provider: 'stripe',
        eventId: event.id,
        eventType,
        orderId,
        paymentReference,
        status: 'success',
        payloadSummary,
      });

      const userEmail =
        object.customer_details?.email ||
        object.customer_email ||
        null;

      if (order && userEmail) {
        await queuePaymentFailureEmail({
          to: userEmail,
          orderNumber: order.orderNumber,
        });
      }

      return res.json({ received: true });
    }

    await createPaymentLog({
      provider: 'stripe',
      eventId: event.id,
      eventType,
      orderId: orderIdFromMetadata,
      paymentReference: object?.id || null,
      status: 'success',
      payloadSummary,
    });

    return res.json({ received: true });
  } catch (error) {
    await createPaymentLog({
      provider: 'stripe',
      eventId: event.id,
      eventType,
      orderId: orderIdFromMetadata,
      paymentReference: object?.id || null,
      status: 'failure',
      payloadSummary,
      error: error.message,
    });

    return res.status(500).send('Webhook processing failed');
  }
};

export { stripeWebhookController };