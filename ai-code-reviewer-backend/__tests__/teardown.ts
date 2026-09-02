import prisma from '../src/config/database';
import redisClient from '../src/config/redis';
import validationQueue from '../src/queues/validation.queue';

afterAll(async () => {
  await Promise.allSettled([
    validationQueue.close(),
    redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
    prisma.$disconnect(),
  ]);
});
