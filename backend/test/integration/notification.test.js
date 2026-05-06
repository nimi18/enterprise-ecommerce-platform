import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import NotificationLog from '../../src/models/notificationLog.model.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory, createUserFactory } from '../helpers/factories.js';

const createOrderForUser = async ({ userId, product }) => {
  return Order.create({
    orderNumber: `ORD-NOTIFY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    paymentReference: 'cs_test_notify',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingMethod: 'standard',
    paidAt: new Date(),
  });
};

describe('Notification API', () => {
  it('should allow admin to list notification logs', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'NOTIFY-LIST-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_confirmed',
      channel: 'email',
      templateName: 'order-confirmed',
      status: 'failed',
      payloadSummary: {
        orderNumber: order.orderNumber,
        customerEmail: 'customer@example.com',
      },
      failureReason: 'SMTP temporary failure',
    });

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.pagination.total).to.equal(1);
  });

  it('should filter notification logs by orderId and status', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'NOTIFY-FILTER-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_confirmed',
      channel: 'email',
      templateName: 'order-confirmed',
      status: 'failed',
      payloadSummary: {
        orderNumber: order.orderNumber,
        customerEmail: 'customer@example.com',
      },
      failureReason: 'SMTP temporary failure',
    });

    await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_shipped',
      channel: 'system',
      templateName: 'order-shipped',
      status: 'sent',
      payloadSummary: {
        orderNumber: order.orderNumber,
      },
    });

    const response = await request(app)
      .get(`/api/notifications?orderId=${order._id}&status=failed`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].status).to.equal('failed');
  });

  it('should get notification logs by order', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'NOTIFY-BY-ORDER-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_confirmed',
      channel: 'email',
      templateName: 'order-confirmed',
      status: 'failed',
      payloadSummary: {
        orderNumber: order.orderNumber,
        customerEmail: 'customer@example.com',
      },
      failureReason: 'SMTP temporary failure',
    });

    const response = await request(app)
      .get(`/api/notifications/order/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
  });

  it('should allow admin to resend failed email notification', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'NOTIFY-RESEND-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    const notificationLog = await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_confirmed',
      channel: 'email',
      templateName: 'order-confirmed',
      status: 'failed',
      payloadSummary: {
        orderNumber: order.orderNumber,
        customerEmail: 'customer@example.com',
      },
      failureReason: 'SMTP temporary failure',
    });

    const response = await request(app)
      .post(`/api/notifications/${notificationLog._id}/resend`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.status).to.equal('queued');
    expect(response.body.data.failureReason).to.equal(null);
    expect(response.body.data.payloadSummary.resentTo).to.equal(
      'customer@example.com'
    );
  });

  it('should not resend system-only notification', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const user = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'NOTIFY-SYSTEM-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    const notificationLog = await NotificationLog.create({
      user: user._id,
      order: order._id,
      type: 'order_shipped',
      channel: 'system',
      templateName: 'order-shipped',
      status: 'sent',
      payloadSummary: {
        orderNumber: order.orderNumber,
      },
    });

    const response = await request(app)
      .post(`/api/notifications/${notificationLog._id}/resend`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should block non-admin from notification logs', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(403);
    expect(response.body.success).to.equal(false);
  });
});