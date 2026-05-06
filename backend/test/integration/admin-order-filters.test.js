import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory, createUserFactory } from '../helpers/factories.js';

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
      `ORD-FILTER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

describe('Admin Order Filters API', () => {
  it('should filter orders by orderStatus', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-STATUS-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      orderNumber: 'ORD-CONFIRMED-001',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderStatus: 'cancelled',
      paymentStatus: 'pending',
      orderNumber: 'ORD-CANCELLED-001',
    });

    const response = await request(app)
      .get('/api/admin/orders?orderStatus=confirmed')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderStatus).to.equal('confirmed');
    expect(response.body.data.pagination.total).to.equal(1);
  });

  it('should filter orders by paymentStatus', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-PAYMENT-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      orderNumber: 'ORD-PAID-001',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      orderNumber: 'ORD-PENDING-001',
    });

    const response = await request(app)
      .get('/api/admin/orders?paymentStatus=paid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].paymentStatus).to.equal('paid');
  });

  it('should filter orders by userId', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customerOne = await createUserFactory({
      email: 'customer-one@example.com',
      role: 'customer',
    });

    const customerTwo = await createUserFactory({
      email: 'customer-two@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-USER-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customerOne._id,
      product,
      orderNumber: 'ORD-USER-ONE',
    });

    await createOrderForUser({
      userId: customerTwo._id,
      product,
      orderNumber: 'ORD-USER-TWO',
    });

    const response = await request(app)
      .get(`/api/admin/orders?userId=${customerOne._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].user.toString()).to.equal(
      customerOne._id.toString()
    );
  });

  it('should search orders by order number', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-SEARCH-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-SPECIAL-SEARCH-123',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-NORMAL-456',
    });

    const response = await request(app)
      .get('/api/admin/orders?search=SPECIAL-SEARCH')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderNumber).to.equal(
      'ORD-SPECIAL-SEARCH-123'
    );
  });

  it('should search orders by payment reference', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-PAYREF-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-PAYREF-001',
      paymentReference: 'cs_test_special_payment_ref',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-PAYREF-002',
      paymentReference: 'cs_test_other',
    });

    const response = await request(app)
      .get('/api/admin/orders?search=special_payment')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].paymentReference).to.equal(
      'cs_test_special_payment_ref'
    );
  });

  it('should filter orders by date range', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-DATE-001',
      price: 1000,
    });

    const oldDate = new Date('2025-01-01T00:00:00.000Z');
    const recentDate = new Date('2026-01-01T00:00:00.000Z');

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-OLD-DATE',
      createdAt: oldDate,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-RECENT-DATE',
      createdAt: recentDate,
    });

    const response = await request(app)
      .get(
        '/api/admin/orders?startDate=2025-12-01T00:00:00.000Z&endDate=2026-12-31T23:59:59.999Z'
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].orderNumber).to.equal('ORD-RECENT-DATE');
  });

  it('should paginate admin orders', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-PAGINATION-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-PAGE-001',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-PAGE-002',
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-PAGE-003',
    });

    const response = await request(app)
      .get('/api/admin/orders?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(2);
    expect(response.body.data.pagination.page).to.equal(1);
    expect(response.body.data.pagination.limit).to.equal(2);
    expect(response.body.data.pagination.total).to.equal(3);
    expect(response.body.data.pagination.totalPages).to.equal(2);
  });

  it('should sort admin orders by total ascending', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const customer = await createUserFactory({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ADMIN-FILTER-SORT-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-HIGH-TOTAL',
      total: 5000,
    });

    await createOrderForUser({
      userId: customer._id,
      product,
      orderNumber: 'ORD-LOW-TOTAL',
      total: 1000,
    });

    const response = await request(app)
      .get('/api/admin/orders?sortBy=total&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items[0].orderNumber).to.equal('ORD-LOW-TOTAL');
    expect(response.body.data.items[1].orderNumber).to.equal('ORD-HIGH-TOTAL');
  });

  it('should reject invalid userId filter', async () => {
    const { token } = await loginAndGetToken({
      email: 'admin@example.com',
      role: 'admin',
    });

    const response = await request(app)
      .get('/api/admin/orders?userId=invalid-user-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });
});