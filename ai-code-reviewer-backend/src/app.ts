import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import validationRoutes from './routes/validation.routes';
import notificationRoutes from './routes/notification.routes';
import repositoryRoutes from './routes/repository.routes';
import settingsRoutes from './routes/settings.routes';
import evalRoutes from './routes/eval.routes';
import prisma from './config/database';
import redisClient from './config/redis';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Public health — no auth, no rate limit
app.get('/health', async (_req, res) => {
  let redis = false;
  let db = false;

  try {
    if (redisClient.isReady) {
      const pong = await redisClient.ping();
      redis = pong === 'PONG';
    }
  } catch {
    redis = false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }

  const payload = {
    ok: redis && db,
    redis,
    db,
    reviewMode: config.review.mode,
  };

  res.status(payload.ok ? 200 : 503).json(payload);
});

// Rate limiting
app.use(generalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/eval', evalRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
