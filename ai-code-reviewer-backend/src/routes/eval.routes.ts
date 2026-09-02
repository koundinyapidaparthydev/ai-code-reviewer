import { Router, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { reportPath } from '../eval/load';

const router = Router();

router.use(authMiddleware);

router.get('/last', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const file = reportPath();
    const raw = await fs.readFile(file, 'utf8');
    res.status(200).json(JSON.parse(raw));
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'No eval report yet. Run npm run eval.' });
      return;
    }
    next(error);
  }
});

export default router;
