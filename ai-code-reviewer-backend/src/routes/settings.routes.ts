import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.userId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user.userId,
          emailNotifications: true,
          notificationFrequency: 'realtime',
          defaultAiModel: 'gpt-4',
          validationSensitivity: 'moderate',
          maxFilesPerValidation: 20,
        },
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/settings
 * @desc    Update user settings
 * @access  Private
 */
router.patch('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const {
      emailNotifications,
      notificationFrequency,
      webhookUrl,
      defaultAiModel,
      validationSensitivity,
      defaultFileExtensions,
      excludedPaths,
      maxFilesPerValidation,
    } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.userId },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(notificationFrequency && { notificationFrequency }),
        ...(webhookUrl !== undefined && { webhookUrl }),
        ...(defaultAiModel && { defaultAiModel }),
        ...(validationSensitivity && { validationSensitivity }),
        ...(defaultFileExtensions && { defaultFileExtensions }),
        ...(excludedPaths && { excludedPaths }),
        ...(maxFilesPerValidation && { maxFilesPerValidation }),
      },
      create: {
        userId: req.user.userId,
        emailNotifications: emailNotifications ?? true,
        notificationFrequency: notificationFrequency || 'realtime',
        defaultAiModel: defaultAiModel || 'gpt-4',
        validationSensitivity: validationSensitivity || 'moderate',
        maxFilesPerValidation: maxFilesPerValidation || 20,
      },
    });

    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/settings/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { name, email, avatarUrl } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        emailVerified: true,
        githubUsername: true,
        createdAt: true,
      },
    });

    logger.info(`Profile updated for user ${req.user.userId}`);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/settings/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: hashedPassword },
    });

    logger.info(`Password changed for user ${req.user.userId}`);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/settings/regenerate-api-key/:type
 * @desc    Regenerate API key
 * @access  Private
 */
router.post('/regenerate-api-key/:type', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { type } = req.params;

    if (!['github', 'openai', 'anthropic', 'azure_openai'].includes(type)) {
      res.status(400).json({ error: 'Invalid API key type' });
      return;
    }

    // TODO: Implement actual API key generation and encryption
    logger.info(`API key regeneration requested for type ${type} by user ${req.user.userId}`);

    res.status(200).json({
      message: 'API key regeneration initiated',
      type,
      status: 'pending',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
