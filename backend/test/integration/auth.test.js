import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        name: 'Nimita',
        email: 'nimita@example.com',
        password: 'password123',
      });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.user.email).to.equal('nimita@example.com');
      expect(response.body.data.token).to.be.a('string');
    });

    it('should fail for invalid payload', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        name: 'N',
        email: 'invalid-email',
        password: '123',
      });

      expect(response.status).to.equal(400);
      expect(response.body.success).to.equal(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'Nimita',
        email: 'nimita@example.com',
        password: 'password123',
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'nimita@example.com',
        password: 'password123',
      });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.token).to.be.a('string');
    });

    it('should fail for wrong credentials', async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'Nimita',
        email: 'nimita@example.com',
        password: 'password123',
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'nimita@example.com',
        password: 'wrongpass123',
      });

      expect(response.status).to.equal(401);
      expect(response.body.success).to.equal(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should fetch current user for valid token', async () => {
      const signupResponse = await request(app).post('/api/auth/signup').send({
        name: 'Nimita',
        email: 'nimita@example.com',
        password: 'password123',
      });

      const token = signupResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.user.email).to.equal('nimita@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).to.equal(401);
      expect(response.body.success).to.equal(false);
    });
  });
});