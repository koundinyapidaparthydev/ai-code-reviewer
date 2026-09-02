import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import notificationService from '../services/notification.service';
import { Response, NextFunction } from 'express';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.getNotifications(
      req.user.userId,
      unreadOnly
    );

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    await notificationService.markAsRead(req.params.id, req.user.userId);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    await notificationService.markAllAsRead(req.user.userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    await notificationService.deleteNotification(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
