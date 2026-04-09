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
    expect(addResponse.body.data).to.have.length(1);

    const getResponse = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data).to.have.length(1);
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
    expect(removeResponse.body.data).to.have.length(0);
  });
});