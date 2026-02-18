import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';
import { env } from '../config/env.js';

let client = null;
let db = null;
let filesBucket = null;

const getDbName = () => env.MONGODB_DB_NAME || 'career_tools';

export const isMongoEnabled = () => {
  return Boolean(env.MONGODB_URI);
};

export const connectMongo = async () => {
  if (!isMongoEnabled()) return null;
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 10,
  });
  await client.connect();
  db = client.db(getDbName());
  filesBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  return db;
};

export const getMongoDb = () => {
  if (!db) {
    throw new Error('MongoDB is not connected yet.');
  }
  return db;
};

export const getFilesBucket = () => {
  if (!filesBucket) {
    throw new Error('MongoDB GridFS bucket is not initialized.');
  }
  return filesBucket;
};

export const parseObjectId = (value) => {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
};

export const closeMongo = async () => {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
  filesBucket = null;
};

