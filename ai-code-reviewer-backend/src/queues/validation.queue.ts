import Bull from 'bull';
import { config } from '../config';
import logger from '../utils/logger';

export interface ValidationJob {
  validationId: string;
  userId: string;
  workspacePath?: string;
  files: Array<{
    fileName: string;
    filePath: string;
    content: string;
  }>;
}

const validationQueue = new Bull<ValidationJob>('validation', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: false,
  },
});

validationQueue.on('error', (error) => {
  logger.error('Validation queue error:', error);
});

validationQueue.on('failed', (job, error) => {
  logger.error(`Validation job ${job?.id} failed:`, error);
});

validationQueue.on('completed', (job) => {
  logger.info(`Validation job ${job.id} completed successfully`);
});

export default validationQueue;
