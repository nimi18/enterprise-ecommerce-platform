import ERROR_CODES from '../constants/errorCodes.js';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository.js';
import AppError from '../utils/appError.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const buildAuthResponse = (user) => {
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

const signup = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409, ERROR_CODES.CONFLICT);
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  return buildAuthResponse(user);
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email, { includePassword: true });

  if (!user) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive', 403, ERROR_CODES.FORBIDDEN);
  }

  const isPasswordMatched = await comparePassword(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.UNAUTHORIZED);
  }

  return buildAuthResponse(user);
};

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive', 403, ERROR_CODES.FORBIDDEN);
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};

export { signup, login, getCurrentUser };