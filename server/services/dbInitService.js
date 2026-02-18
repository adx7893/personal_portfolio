import { connectMongo, getMongoDb, isMongoEnabled } from './mongoService.js';

export const initializeDatabase = async () => {
  if (!isMongoEnabled()) return;

  await connectMongo();
  const db = getMongoDb();

  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true }),
    db.collection('jobs').createIndex({ id: 1 }, { unique: true, sparse: true }),
    db.collection('savedJobs').createIndex({ userId: 1, jobId: 1 }, { unique: true }),
    db.collection('applications').createIndex({ userId: 1, jobId: 1 }, { unique: true }),
  ]);
};

