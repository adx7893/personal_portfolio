import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createRateLimitMiddleware } from './config/rateLimit.js';
import { env } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { resumeAnalyzerRoutes } from './routes/resumeAnalyzerRoutes.js';
import { aiRoutes } from './routes/aiRoutes.js';
import { jobRoutes } from './routes/jobRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { fileRoutes } from './routes/fileRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Career tools API is running.',
    endpoints: [
      'GET /api/health',
      'POST /api/analyze-resume',
      'POST /api/ai/generate-cover-letter',
      'POST /api/auth/signup',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/user/profile',
      'PUT /api/user/profile',
      'PUT /api/user/change-password',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      'POST /api/jobs/save',
      'POST /api/jobs/apply',
      'POST /api/ai/match-job',
      'POST /api/files/upload',
      'GET /api/files/:id',
    ],
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Career tools API is healthy.' });
});

app.use('/api', createRateLimitMiddleware());
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', resumeAnalyzerRoutes);
app.use('/api', aiRoutes);
app.use('/api', jobRoutes);
app.use('/api', fileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
