import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

const createOrderForUser = async ({
  userId,
  product,
  orderNumber,
  paymentStatus = 'pending',
  orderStatus = 'pending',
  total = null,
  paymentReference = null,
  trackingNumber = null,
  createdAt = null,
}) => {
  const order = await Order.create({
    orderNumber:
      orderNumber ||
      `ORD-CUSTOMER-FILTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    total: total ?? product.price + 50,
    paymentProvider: 'stripe',
    paymentReference,
    paymentStatus,
    orderStatus,
    shippingMethod: 'standard',
    trackingNumber,
    paidAt: paymentStatus === 'paid' ? new Date() : null,
  });

  if (createdAt) {
    await Order.collection.updateOne(
      { _id: order._id },
      {
        $set: {
          createdAt,
          updatedAt: createdAt,
        },
      }
    );

    return Order.findById(order._id);
  }

  return order;
};

describe('Customer Order Filters API', () => {
  it('should filter own orders by orderStatus', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-STATUS-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      orderNumber: 'ORD-CUSTOMER-CONFIRMED',
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderStatus: 'cancelled',
      paymentStatus: 'pending',
      orderNumber: 'ORD-CUSTOMER-CANCELLED',
    });

    const response = await request(app)
      .get('/api/orders?orderStatus=confirmed')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderStatus).to.equal('confirmed');
    expect(response.body.data.pagination.total).to.equal(1);
  });

  it('should filter own orders by paymentStatus', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-PAYMENT-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      orderNumber: 'ORD-CUSTOMER-PAID',
    });

    await createOrderForUser({
      userId: user._id,
      product,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      orderNumber: 'ORD-CUSTOMER-PENDING',
    });

    const response = await request(app)
      .get('/api/orders?paymentStatus=paid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].paymentStatus).to.equal('paid');
  });

  it('should search own orders by order number', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-SEARCH-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-MY-SPECIAL-123',
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-MY-NORMAL-456',
    });

    const response = await request(app)
      .get('/api/orders?search=MY-SPECIAL')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderNumber).to.equal(
      'ORD-MY-SPECIAL-123'
    );
  });

  it('should not return another user order in search results', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const otherUserLogin = await loginAndGetToken({
      email: 'other@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-OWNERSHIP-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-OWN-MATCH',
    });

    await createOrderForUser({
      userId: otherUserLogin.user._id,
      product,
      orderNumber: 'ORD-OTHER-MATCH',
    });

    const response = await request(app)
      .get('/api/orders?search=MATCH')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderNumber).to.equal('ORD-OWN-MATCH');
  });

  it('should paginate own orders', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-PAGE-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-CUSTOMER-PAGE-001',
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-CUSTOMER-PAGE-002',
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-CUSTOMER-PAGE-003',
    });

    const response = await request(app)
      .get('/api/orders?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(2);
    expect(response.body.data.pagination.total).to.equal(3);
    expect(response.body.data.pagination.totalPages).to.equal(2);
  });

  it('should sort own orders by total ascending', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'CUSTOMER-FILTER-SORT-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-CUSTOMER-HIGH',
      total: 5000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
      orderNumber: 'ORD-CUSTOMER-LOW',
      total: 1000,
    });

    const response = await request(app)
      .get('/api/orders?sortBy=total&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items[0].orderNumber).to.equal(
      'ORD-CUSTOMER-LOW'
    );
  });
});