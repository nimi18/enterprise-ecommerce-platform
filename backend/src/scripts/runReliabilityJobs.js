import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import logger from '../config/logger.js';
import { runReliabilityJobs } from '../jobs/reliability.job.js';

const run = async () => {
  try {
    await connectDB();

    const result = await runReliabilityJobs();

    logger.info({ result }, 'Reliability job script finished');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error(
      {
        err: {
          message: error.message,
          stack: error.stack,
        },
      },
      'Reliability job script failed'
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

run();