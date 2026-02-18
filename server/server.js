import { app } from './app.js';
import { env } from './config/env.js';
import { connectMongoose, disconnectMongoose } from './config/mongoose.js';
import { startJobAggregationScheduler } from './services/jobAggregationService.js';
import { initializeDatabase } from './services/dbInitService.js';

const bootstrap = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await connectMongoose();
    await initializeDatabase();
    console.log('MongoDB connected successfully');

    const server = app.listen(env.PORT, () => {
      console.log(`Career tools API listening on http://localhost:${env.PORT}`);
      startJobAggregationScheduler();
    });

    const shutdown = async () => {
      console.log('\nShutting down server...');
      server.close(async () => {
        await disconnectMongoose();
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
