import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createCategoryFactory } from '../helpers/factories.js';

describe('Product API', () => {
  describe('POST /api/products', () => {
    it('should allow admin to create product', async () => {
      const { token, user } = await loginAndGetToken({
        email: 'admin@example.com',
        role: 'admin',
      });

      const category = await createCategoryFactory();

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'iPhone 15',
          description: 'Latest phone',
          shortDescription: 'Premium phone',
          sku: 'IPHONE15-001',
          price: 50000,
          compareAtPrice: 55000,
          currency: 'INR',
          category: category._id.toString(),
          stock: 10,
          images: ['https://example.com/iphone.jpg'],
          isActive: true,
        });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.slug).to.equal('iphone-15');
      expect(response.body.data.createdBy.toString()).to.equal(user._id.toString());
    });

    it('should fail for invalid category', async () => {
      const { token } = await loginAndGetToken({
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'iPhone 15',
          description: 'Latest phone',
          sku: 'IPHONE15-001',
          price: 50000,
          category: '680f3a6f0c1234567890abcd',
          stock: 10,
        });

      expect(response.status).to.equal(404);
      expect(response.body.success).to.equal(false);
    });
  });

  describe('GET /api/products', () => {
    it('should list products', async () => {
      const { token } = await loginAndGetToken({
        email: 'admin@example.com',
        role: 'admin',
      });

      const category = await createCategoryFactory();

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'iPhone 15',
          description: 'Latest phone',
          shortDescription: 'Premium phone',
          sku: 'IPHONE15-001',
          price: 50000,
          compareAtPrice: 55000,
          currency: 'INR',
          category: category._id.toString(),
          stock: 10,
          images: ['https://example.com/iphone.jpg'],
        });

      const response = await request(app).get('/api/products');
      console.log(response.body);
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.items).to.have.length(1);
      expect(response.body.data.pagination.total).to.equal(1);
    });
  });
});