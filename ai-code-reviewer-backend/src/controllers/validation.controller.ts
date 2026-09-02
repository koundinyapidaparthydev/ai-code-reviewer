import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import validationService from '../services/validation.service';

export class ValidationController {
  async createManualValidation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const validation = await validationService.createManualValidation(
        req.user.userId,
        files
      );

      res.status(201).json(validation);
    } catch (error) {
      next(error);
    }
  }

  async getValidations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await validationService.getValidations(
        req.user.userId,
        limit,
        offset
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getValidationById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validation = await validationService.getValidationById(
        req.params.id,
        req.user.userId
      );

      res.status(200).json(validation);
    } catch (error) {
      next(error);
    }
  }

  async revalidate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validation = await validationService.revalidate(
        req.params.id,
        req.user.userId
      );

      res.status(201).json(validation);
    } catch (error) {
      next(error);
    }
  }

  async deleteValidation(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await validationService.deleteValidation(
        req.params.id,
        req.user.userId
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const statistics = await validationService.getStatistics(req.user.userId);

      res.status(200).json(statistics);
    } catch (error) {
      next(error);
    }
  }
}

export default new ValidationController();
