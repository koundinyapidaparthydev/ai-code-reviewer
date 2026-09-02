import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/repositories
 * @desc    Get all user repositories
 * @access  Private
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const repositories = await prisma.repository.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            validations: true,
          },
        },
      },
    });

    res.status(200).json(repositories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/repositories/connect
 * @desc    Connect a new repository
 * @access  Private
 */
router.post('/connect', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { repoUrl, name, fullName, githubId, defaultBranch, webhookActive } = req.body;

    if (!githubId || !fullName) {
      res.status(400).json({ error: 'GitHub ID and full name are required' });
      return;
    }

    // Check if repository already connected
    const existing = await prisma.repository.findFirst({
      where: {
        userId: req.user.userId,
        githubId: githubId,
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Repository already connected' });
      return;
    }

    const repository = await prisma.repository.create({
      data: {
        userId: req.user.userId,
        name: name || fullName.split('/')[1],
        fullName,
        githubId: githubId,
        defaultBranch: defaultBranch || 'main',
        webhookActive: webhookActive || false,
        autoValidate: true,
      },
    });

    logger.info(`Repository ${fullName} connected by user ${req.user.userId}`);

    res.status(201).json(repository);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/repositories/:id
 * @desc    Get repository details
 * @access  Private
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const repository = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
      include: {
        validations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!repository) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    res.status(200).json(repository);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/repositories/:id/settings
 * @desc    Update repository settings
 * @access  Private
 */
router.patch('/:id/settings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { autoValidate, webhookActive, validationRules, defaultBranch } = req.body;

    const repository = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!repository) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    const updated = await prisma.repository.update({
      where: { id: req.params.id },
      data: {
        ...(autoValidate !== undefined && { autoValidate }),
        ...(webhookActive !== undefined && { webhookActive }),
        ...(validationRules && { validationRules }),
        ...(defaultBranch && { defaultBranch }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/repositories/:id/test-webhook
 * @desc    Test repository webhook
 * @access  Private
 */
router.post('/:id/test-webhook', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const repository = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!repository) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    // TODO: Implement actual webhook test
    logger.info(`Webhook test requested for repository ${repository.fullName}`);

    res.status(200).json({
      message: 'Webhook test initiated',
      status: 'pending',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/repositories/:id
 * @desc    Disconnect repository
 * @access  Private
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const repository = await prisma.repository.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (!repository) {
      res.status(404).json({ error: 'Repository not found' });
      return;
    }

    await prisma.repository.delete({
      where: { id: req.params.id },
    });

    logger.info(`Repository ${repository.fullName} disconnected by user ${req.user.userId}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
