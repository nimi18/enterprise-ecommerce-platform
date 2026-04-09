import ERROR_CODES from '../constants/errorCodes.js';
import { findUserById } from '../repositories/user.repository.js';
import AppError from '../utils/appError.js';
import { verifyToken } from '../utils/jwt.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is required', 401, ERROR_CODES.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  let decodedToken;

  try {
    decodedToken = verifyToken(token);
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401, ERROR_CODES.UNAUTHORIZED));
  }

  const user = await findUserById(decodedToken.userId);

  if (!user) {
    return next(new AppError('User not found', 404, ERROR_CODES.NOT_FOUND));
  }

  if (!user.isActive) {
    return next(new AppError('Your account is inactive', 403, ERROR_CODES.FORBIDDEN));
  }

  req.user = {
    userId: user._id.toString(),
    role: user.role,
  };

  next();
};

export default authMiddleware;