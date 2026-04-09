import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async (mongoUri = env.mongoUri) => {
  await mongoose.connect(mongoUri);
};

export default connectDB;