import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  // Accept either MONGODB_URI or MONGO_URI; fail fast with a clear message if neither is set.
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error(
      'Missing MONGODB_URI environment variable.\n' +
      'Set it in the Render dashboard (Environment) to your MongoDB Atlas connection string,\n' +
      'e.g. mongodb+srv://<user>:<password>@<cluster>.mongodb.net/employee_management'
    );
    process.exit(1);
  }
  try {
    console.log(`Connecting to MongoDB at host: ${new URL(mongoUri.replace(/^mongodb\+srv:/, 'mongodb://')).host}`);
  } catch {
    console.log('Connecting to MongoDB...');
  }
  await mongoose.connect(mongoUri);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
