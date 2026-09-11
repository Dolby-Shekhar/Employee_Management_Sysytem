import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems-ts';
  await mongoose.connect(mongoUri);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
