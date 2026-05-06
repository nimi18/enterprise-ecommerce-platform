import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/user.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { comparePassword } from '../../src/utils/password.js';

describe('User Profile API', () => {
  it('should fetch current user profile without password', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.email).to.equal('customer@example.com');
    expect(response.body.data).to.not.have.property('password');
  });

  it('should update current user profile', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Customer',
        phone: '9999999999',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.name).to.equal('Updated Customer');
    expect(response.body.data.phone).to.equal('9999999999');
    expect(response.body.data).to.not.have.property('password');
  });

  it('should change current user password', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
    });

    const response = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newPassword123',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);

    const updatedUser = await User.findById(user._id);
    const isNewPasswordValid = await comparePassword(
      'newPassword123',
      updatedUser.password
    );

    expect(isNewPasswordValid).to.equal(true);
  });

  it('should reject password change with wrong current password', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
    });

    const response = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should upload or replace avatar using storage adapter', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p94AAAAASUVORK5CYII=',
      'base64'
    );

    const response = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', imageBuffer, {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.avatarUrl).to.be.a('string');
    expect(response.body.data.avatarPublicId).to.be.a('string');
    expect(response.body.data.avatarUrl).to.include('cloudinary.com');
  });

  it('should reject non-image avatar upload', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', Buffer.from('not an image'), {
        filename: 'avatar.txt',
        contentType: 'text/plain',
      });

    expect(response.status).to.equal(500);
    expect(response.body.success).to.equal(false);
  });

  it('should delete current user avatar', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const imageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p94AAAAASUVORK5CYII=',
      'base64'
    );

    await request(app)
      .patch('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', imageBuffer, {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    const response = await request(app)
      .delete('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.avatarUrl).to.equal(null);
    expect(response.body.data.avatarPublicId).to.equal(null);
  });

  it('should block unauthenticated profile access', async () => {
    const response = await request(app).get('/api/users/me');

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});