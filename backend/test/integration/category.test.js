import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { loginAndGetToken } from '../helpers/auth.js';

describe('Category API', () => {
  describe('POST /api/categories', () => {
    it('should allow admin to create category', async () => {
      const { token } = await loginAndGetToken({
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Electronics',
          description: 'Electronic items',
        });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.slug).to.equal('electronics');
    });

    it('should block non-admin from creating category', async () => {
      const { token } = await loginAndGetToken({
        email: 'customer@example.com',
        role: 'customer',
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Electronics',
        });

      expect(response.status).to.equal(403);
      expect(response.body.success).to.equal(false);
    });
  });

  describe('GET /api/categories', () => {
    it('should list categories publicly', async () => {
      const { token } = await loginAndGetToken({
        email: 'admin@example.com',
        role: 'admin',
      });

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Electronics',
        });

      const response = await request(app).get('/api/categories');

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data).to.have.length(1);
    });
  });
});