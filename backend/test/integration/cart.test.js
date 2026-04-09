import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createCouponFactory, createProductFactory } from '../helpers/factories.js';

describe('Cart API', () => {
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
});