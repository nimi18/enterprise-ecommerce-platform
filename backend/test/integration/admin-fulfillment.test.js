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
    orderNumber: `ORD-ADMIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    paymentReference: 'test_payment_reference',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingMethod: 'standard',
    paidAt: new Date(),
  });
};

describe('Admin Fulfillment API', () => {
  it('should allow admin to fetch all orders', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-ORDER-001',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
    });

    const response = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
  });

  it('should block non-admin from fetching all orders', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(403);
    expect(response.body.success).to.equal(false);
  });

  it('should allow admin to update order status with tracking details', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-SHIP-001',
    });

    const order = await createOrderForUser({
      userId: customer._id,
      product,
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderStatus: 'shipped',
        courierName: 'Blue Dart',
        trackingNumber: 'BD123456789IN',
        trackingUrl: 'https://tracking.example.com/BD123456789IN',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.orderStatus).to.equal('shipped');
    expect(response.body.data.courierName).to.equal('Blue Dart');
    expect(response.body.data.trackingNumber).to.equal('BD123456789IN');
    expect(response.body.data.shippedAt).to.not.equal(null);

    const logs = await NotificationLog.find({ order: order._id });

    expect(logs).to.have.length(1);
    expect(logs[0].type).to.equal('order_shipped');
  });

  it('should set deliveredAt when order is delivered', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-DELIVER-001',
    });

    const order = await createOrderForUser({
      userId: customer._id,
      product,
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderStatus: 'delivered',
      });

    expect(response.status).to.equal(200);
    expect(response.body.data.orderStatus).to.equal('delivered');
    expect(response.body.data.deliveredAt).to.not.equal(null);

    const logs = await NotificationLog.find({ order: order._id });

    expect(logs).to.have.length(1);
    expect(logs[0].type).to.equal('order_delivered');
  });
});