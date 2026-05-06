import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import NotificationLog from '../../src/models/notificationLog.model.js';
import Order from '../../src/models/order.model.js';
import Product from '../../src/models/product.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory, createUserFactory } from '../helpers/factories.js';

const createOrderForUser = async ({
  userId,
  product,
  paymentStatus = 'pending',
  orderStatus = 'pending',
  quantity = 1,
}) => {
  return Order.create({
    orderNumber: `ORD-CANCEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user: userId,
    items: [
      {
        product: product._id,
        titleSnapshot: product.title,
        skuSnapshot: product.sku,
        imageSnapshot: product.images?.[0] || '',
        quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
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
    subtotal: product.price * quantity,
    discount: 0,
    shippingCharge: 50,
    total: product.price * quantity + 50,
    paymentProvider: 'stripe',
    paymentReference: paymentStatus === 'paid' ? 'cs_test_cancel' : null,
    paymentStatus,
    orderStatus,
    shippingMethod: 'standard',
    paidAt: paymentStatus === 'paid' ? new Date() : null,
  });
};

describe('Order Cancellation API', () => {
  it('should allow customer to cancel own pending order', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CANCEL-PENDING-001',
      price: 1000,
      stock: 10,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Changed my mind',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.orderStatus).to.equal('cancelled');
    expect(response.body.data.paymentStatus).to.equal('pending');
    expect(response.body.data.cancelledBy).to.equal('customer');
    expect(response.body.data.cancellationReason).to.equal('Changed my mind');
    expect(response.body.data.cancelledAt).to.not.equal(null);
  });

  it('should allow customer to cancel paid confirmed order and restore stock', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CANCEL-PAID-001',
      price: 1000,
      stock: 5,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      quantity: 2,
    });

    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Ordered by mistake',
      });

    expect(response.status).to.equal(200);
    expect(response.body.data.orderStatus).to.equal('cancelled');
    expect(response.body.data.paymentStatus).to.equal('refunded');
    expect(response.body.data.cancelledBy).to.equal('customer');

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).to.equal(7);
  });

  it('should not allow customer to cancel delivered order', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CANCEL-DELIVERED-001',
      price: 1000,
      stock: 10,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'paid',
      orderStatus: 'delivered',
    });

    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Too late',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should not allow customer to cancel another user order', async () => {
    const owner = await createUserFactory({
      email: 'owner@example.com',
      role: 'customer',
    });

    const { token } = await loginAndGetToken({
      email: 'other@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CANCEL-FORBIDDEN-001',
      price: 1000,
      stock: 10,
    });

    const order = await createOrderForUser({
      userId: owner._id,
      product,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Not my order',
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should allow admin to cancel any cancellable order and create notification log', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-CANCEL-001',
      price: 1000,
      stock: 10,
    });

    const order = await createOrderForUser({
      userId: customer._id,
      product,
      paymentStatus: 'pending',
      orderStatus: 'processing',
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Fraud check failed',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.orderStatus).to.equal('cancelled');
    expect(response.body.data.cancelledBy).to.equal('admin');
    expect(response.body.data.cancellationReason).to.equal('Fraud check failed');

    const logs = await NotificationLog.find({ order: order._id });

    expect(logs).to.have.length(1);
    expect(logs[0].type).to.equal('order_cancelled');
  });

  it('should block non-admin from admin cancellation route', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-CANCEL-BLOCK-001',
      price: 1000,
      stock: 10,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: 'Trying admin route',
      });

    expect(response.status).to.equal(403);
    expect(response.body.success).to.equal(false);
  });
});