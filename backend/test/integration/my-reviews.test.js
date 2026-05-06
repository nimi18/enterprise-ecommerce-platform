import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Review from '../../src/models/review.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createProductFactory } from '../helpers/factories.js';

describe('My Reviews API', () => {
  it('should fetch my reviews', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const product = await createProductFactory({
      sku: 'REVIEW-MY-001',
      price: 1000,
    });

    await Review.create({
      user: user._id,
      product: product._id,
      rating: 5,
      title: 'Great product',
      comment: 'Great product and very smooth experience.',
      isActive: true,
    });

    const response = await request(app)
      .get('/api/reviews/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.pagination.total).to.equal(1);
  });

  it('should filter by rating', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const productOne = await createProductFactory({
      sku: 'REVIEW-FILTER-001',
      price: 1000,
    });

    const productTwo = await createProductFactory({
      sku: 'REVIEW-FILTER-002',
      price: 1000,
    });

    await Review.create({
      user: user._id,
      product: productOne._id,
      rating: 5,
      title: 'Excellent product',
      comment: 'Excellent quality and very useful product.',
      isActive: true,
    });

    await Review.create({
      user: user._id,
      product: productTwo._id,
      rating: 3,
      title: 'Okay product',
      comment: 'Okay product but can be improved.',
      isActive: true,
    });

    const response = await request(app)
      .get('/api/reviews/me?rating=5')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.items).to.have.length(1);
    expect(response.body.data.items[0].rating).to.equal(5);
  });
});