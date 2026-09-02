import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { config } from '../config';
import { AuthRequest } from './auth.middleware';

const createRateLimitKey = (identifier: string, type: 'general' | 'validation') => {
  return `ratelimit:${type}:${identifier}`;
};

export const generalRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = createRateLimitKey(ip, 'general');

    const current = await redisClient.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= config.rateLimit.maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: config.rateLimit.windowMs / 1000,
      });
      return;
    }

    if (count === 0) {
      await redisClient.setEx(
        key,
        Math.floor(config.rateLimit.windowMs / 1000),
        '1'
      );
    } else {
      await redisClient.incr(key);
    }

    next();
  } catch (error) {
    // If Redis fails, allow the request
    next();
  }
};

export const validationRateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const key = createRateLimitKey(req.user.userId, 'validation');

    const current = await redisClient.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= config.rateLimit.validationLimitPerHour) {
      res.status(429).json({
        error: 'Validation limit exceeded',
        message: `Maximum ${config.rateLimit.validationLimitPerHour} validations per hour`,
        retryAfter: 3600,
      });
      return;
    }

    if (count === 0) {
      await redisClient.setEx(key, 3600, '1');
    } else {
      await redisClient.incr(key);
    }

    next();
  } catch (error) {
    // If Redis fails, allow the request
    next();
  }
};
