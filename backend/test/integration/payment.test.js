import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import stripe from '../../src/config/stripe.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

const createPendingOrderForUser = async ({ userId, product }) => {
  return Order.create({
    orderNumber: `ORD-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

describe('Payment API', () => {
  let originalCreateSession;

  beforeEach(() => {
    originalCreateSession = stripe.checkout.sessions.create;
  });

  afterEach(() => {
    stripe.checkout.sessions.create = originalCreateSession;
  });

  it('should create Stripe checkout session for pending order', async () => {
    stripe.checkout.sessions.create = async () => ({
      id: 'cs_test_mocked',
      url: 'https://checkout.stripe.com/test-session',
    });

    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'PAYMENT-SESSION-001',
      price: 1000,
    });

    const order = await createPendingOrderForUser({
      userId: user._id,
      product,
    });

    const response = await request(app)
      .post(`/api/payments/checkout/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.url).to.equal('https://checkout.stripe.com/test-session');
  });

  it('should not create checkout session for another user order', async () => {
    const { user } = await loginAndGetToken({
      email: 'owner@example.com',
      role: 'customer',
    });

    const { token } = await loginAndGetToken({
      email: 'other@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'PAYMENT-FORBIDDEN-001',
      price: 1000,
    });

    const order = await createPendingOrderForUser({
      userId: user._id,
      product,
    });

    const response = await request(app)
      .post(`/api/payments/checkout/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should not create checkout session for already paid order', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'PAYMENT-PAID-001',
      price: 1000,
    });

    const order = await createPendingOrderForUser({
      userId: user._id,
      product,
    });

    order.paymentStatus = 'paid';
    await order.save();

    const response = await request(app)
      .post(`/api/payments/checkout/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should block unauthenticated payment session creation', async () => {
    const response = await request(app).post(
      '/api/payments/checkout/680f3a6f0c1234567890abcd'
    );

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});