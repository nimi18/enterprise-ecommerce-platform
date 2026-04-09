import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import connectDB from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error(
      {
        err: {
          message: error.message,
          stack: error.stack,
        },
      },
      'Failed to start server'
    );

    process.exit(1);
  }
};

startServer();