import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Cart from '../../src/models/cart.model.js';
import Wishlist from '../../src/models/wishlist.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createCouponFactory, createProductFactory } from '../helpers/factories.js';

describe('Cart API', () => {
  it('should create and fetch empty cart for authenticated user', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(0);
    expect(response.body.data.subtotal).to.equal(0);
    expect(response.body.data.discount).to.equal(0);
    expect(response.body.data.total).to.equal(0);
    expect(response.body.data).to.have.property('lastActivityAt');
    expect(response.body.data).to.have.property('expiresAt');
  });

  it('should add product to cart', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].product._id.toString()).to.equal(
      product._id.toString()
    );
    expect(response.body.data.items[0].product.title).to.equal(product.title);
    expect(response.body.data.subtotal).to.equal(2000);
  });

  it('should increase quantity when same product is added again', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 3,
      });

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].quantity).to.equal(5);
    expect(response.body.data.subtotal).to.equal(5000);
  });

  it('should update cart item quantity', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const response = await request(app)
      .patch(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        quantity: 4,
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items[0].quantity).to.equal(4);
    expect(response.body.data.subtotal).to.equal(4000);
  });

  it('should remove cart item', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const response = await request(app)
      .delete(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(0);
    expect(response.body.data.subtotal).to.equal(0);
  });

  it('should clear cart', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const response = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(0);
    expect(response.body.data.total).to.equal(0);
  });

  it('should move cart item to wishlist', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 1,
      });

    const response = await request(app)
      .post(`/api/cart/${product._id}/move-to-wishlist`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(0);

    const cartResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(cartResponse.status).to.equal(200);
    expect(cartResponse.body.data.items).to.have.length(0);
  });

  it('should apply and remove coupon', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await createCouponFactory({
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 1000,
      maxDiscount: 500,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    const applyResponse = await request(app)
      .post('/api/cart/apply-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'SAVE10',
      });

    expect(applyResponse.status).to.equal(200);
    expect(applyResponse.body.data.discount).to.equal(200);
    expect(applyResponse.body.data.total).to.equal(1800);

    const removeResponse = await request(app)
      .delete('/api/cart/remove-coupon')
      .set('Authorization', `Bearer ${token}`);

    expect(removeResponse.status).to.equal(200);
    expect(removeResponse.body.data.discount).to.equal(0);
    expect(removeResponse.body.data.total).to.equal(2000);
  });

  it('should reject adding product beyond available stock', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 1,
      price: 1000,
    });

    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 2,
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should reject updating missing cart item', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    const response = await request(app)
      .patch(`/api/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        quantity: 1,
      });

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should reject applying invalid coupon', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 1,
      });

    const response = await request(app)
      .post('/api/cart/apply-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'INVALID',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should reject applying coupon on empty cart', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .post('/api/cart/apply-coupon')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'SAVE10',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should update lastActivityAt after cart mutation', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      stock: 20,
      price: 1000,
    });

    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 1,
      });

    const cart = await Cart.findOne({ user: user._id });

    expect(cart.lastActivityAt).to.not.equal(null);
  });

  it('should block unauthenticated cart access', async () => {
    const response = await request(app).get('/api/cart');

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});