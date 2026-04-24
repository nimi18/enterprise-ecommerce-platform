import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import env from '../../src/config/env.js';
import stripe from '../../src/config/stripe.js';
import Order from '../../src/models/order.model.js';
import PaymentLog from '../../src/models/paymentLog.model.js';
import { createProductFactory, createUserFactory } from '../helpers/factories.js';

const createPendingOrderForUser = async ({ userId, product }) => {
  return Order.create({
    orderNumber: `ORD-WEBHOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user: userId,
    items: [
      {
        product: product._id,
        titleSnapshot: product.title,
        skuSnapshot: product.sku,
        imageSnapshot: product.images?.[0] || '',
        quantity: 1,
        unitPrice: product.price,
        lineTotal: product.price,
      },
    ],
    addressSnapshot: {
      fullName: 'Test User',
      phone: '9999999999',
      addressLine1: '123 Test Street',
      addressLine2: '',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      landmark: '',
      addressType: 'home',
    },
    couponSnapshot: null,
    subtotal: product.price,
    discount: 0,
    shippingCharge: 50,
    total: product.price + 50,
    paymentProvider: 'stripe',
    paymentReference: null,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingMethod: 'standard',
  });
};

const buildSignedWebhookRequest = ({ event }) => {
  const payload = JSON.stringify(event);

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.stripeWebhookSecret,
  });

  return {
    payload,
    signature,
  };
};

describe('Stripe Webhook API', () => {
  it('should update order and create payment log on checkout.session.completed', async () => {
    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'WEBHOOK-PRODUCT-001',
      price: 1000,
    });

    const order = await createPendingOrderForUser({
      userId: user._id,
      product,
    });

    const event = {
      id: `evt_test_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook',
          object: 'checkout.session',
          metadata: {
            orderId: order._id.toString(),
            userId: user._id.toString(),
          },
          amount_total: 105000,
          currency: 'inr',
          payment_status: 'paid',
          status: 'complete',
        },
      },
    };

    const { payload, signature } = buildSignedWebhookRequest({ event });

    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).to.equal(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).to.equal('paid');
    expect(updatedOrder.orderStatus).to.equal('confirmed');
    expect(updatedOrder.paymentReference).to.equal('cs_test_webhook');
    expect(updatedOrder.paidAt).to.not.equal(null);

    const paymentLog = await PaymentLog.findOne({ eventId: event.id });
    expect(paymentLog).to.not.equal(null);
    expect(paymentLog.eventType).to.equal('checkout.session.completed');
    expect(paymentLog.status).to.equal('success');
  });

  it('should handle duplicate Stripe webhook event safely', async () => {
    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'WEBHOOK-DUPLICATE-001',
      price: 1000,
    });

    const order = await createPendingOrderForUser({
      userId: user._id,
      product,
    });

    const event = {
      id: `evt_duplicate_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_duplicate',
          object: 'checkout.session',
          metadata: {
            orderId: order._id.toString(),
            userId: user._id.toString(),
          },
          amount_total: 105000,
          currency: 'inr',
          payment_status: 'paid',
          status: 'complete',
        },
      },
    };

    const { payload, signature } = buildSignedWebhookRequest({ event });

    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    const duplicateResponse = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(duplicateResponse.status).to.equal(200);
    expect(duplicateResponse.body.duplicate).to.equal(true);

    const logs = await PaymentLog.find({ eventId: event.id });
    expect(logs).to.have.length(1);
  });

  it('should reject webhook with invalid signature', async () => {
    const payload = JSON.stringify({
      id: `evt_invalid_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_invalid',
          metadata: {},
        },
      },
    });

    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'invalid_signature')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).to.equal(400);
  });
});