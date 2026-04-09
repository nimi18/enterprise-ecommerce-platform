import request from 'supertest';
import app from '../../src/app.js';
import { createUserFactory } from './factories.js';

const loginAndGetToken = async (overrides = {}) => {
  const plainPassword = overrides.password || 'password123';

  const user = await createUserFactory({
    ...overrides,
    password: plainPassword,
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: plainPassword,
    });

  return {
    user,
    token: response.body.data.token,
    response,
  };
};

export { loginAndGetToken };