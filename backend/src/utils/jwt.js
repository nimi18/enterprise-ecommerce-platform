import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export { generateToken, verifyToken };