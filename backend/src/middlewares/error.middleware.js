import logger from '../config/logger.js';
import AppError from '../utils/appError.js';

const errorMiddleware = (err, req, res, next) => {
  logger.error(
    {
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        details: err.details,
      },
      method: req.method,
      url: req.originalUrl,
    },
    'Unhandled error'
  );

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered',
      code: 'CONFLICT',
      details: err.keyValue,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

export default errorMiddleware;