import AppError from '../utils/appError.js';

const notFoundMiddleware = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

export default notFoundMiddleware;