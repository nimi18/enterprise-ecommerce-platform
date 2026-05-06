import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

describe('Wishlist API', () => {
  it('should add and fetch wishlist items', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory();

    const addResponse = await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(addResponse.status).to.equal(200);
    expect(addResponse.body.success).to.equal(true);
    expect(addResponse.body.data.items).to.have.length(1);

    const getResponse = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data.items).to.have.length(1);
  });

  it('should not duplicate wishlist item', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory();

    await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
  });

  it('should remove item from wishlist', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory();

    await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    const removeResponse = await request(app)
      .delete(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removeResponse.status).to.equal(200);
    expect(removeResponse.body.data.items).to.have.length(0);
  });

  it('should reject invalid product', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .post('/api/wishlist/invalidid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should block unauthenticated wishlist access', async () => {
    const response = await request(app).get('/api/wishlist');

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});