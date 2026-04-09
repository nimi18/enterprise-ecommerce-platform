import ERROR_CODES from '../constants/errorCodes.js';
import AppError from '../utils/appError.js';

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to access this resource', 403, ERROR_CODES.FORBIDDEN));
    }

    next();
  };
};

export default roleMiddleware;