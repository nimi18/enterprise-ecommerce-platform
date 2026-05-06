import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Order from '../../src/models/order.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

const createOrderForUser = async ({ userId, product }) => {
  return Order.create({
    orderNumber: `ORD-ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

describe('Order API', () => {
  it('should fetch current user orders', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ORDER-LIST-001',
      price: 1000,
    });

    await createOrderForUser({
      userId: user._id,
      product,
    });

    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.pagination.total).to.equal(1);
    expect(response.body.data.items[0].user.toString()).to.equal(
      user._id.toString()
    );
  });

  it('should fetch current user order by id', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ORDER-DETAIL-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: user._id,
      product,
    });

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data._id).to.equal(order._id.toString());
    expect(response.body.data.user.toString()).to.equal(user._id.toString());
  });

  it('should not allow user to fetch another user order', async () => {
    const ownerLogin = await loginAndGetToken({
      email: 'owner@example.com',
      role: 'customer',
    });

    const otherLogin = await loginAndGetToken({
      email: 'other@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'ORDER-FORBIDDEN-001',
      price: 1000,
    });

    const order = await createOrderForUser({
      userId: ownerLogin.user._id,
      product,
    });

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${otherLogin.token}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should block unauthenticated order access', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});