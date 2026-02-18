import mongoose from 'mongoose';
import { env } from './env.js';

export const connectMongoose = async () => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME || 'myapp',
  });

  return mongoose.connection;
};

export const disconnectMongoose = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
