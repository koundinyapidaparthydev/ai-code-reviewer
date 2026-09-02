import { Router } from 'express';
import validationController from '../controllers/validation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationRateLimiter } from '../middleware/rateLimiter.middleware';
import { upload } from '../config/multer';

const router = Router();

// All validation routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/validations/manual
 * @desc    Upload files for manual validation
 * @access  Private
 */
router.post(
  '/manual',
  validationRateLimiter,
  upload.array('files', 20),
  validationController.createManualValidation
);

/**
 * @route   GET /api/validations
 * @desc    Get all validations for current user
 * @access  Private
 */
router.get('/', validationController.getValidations);

/**
 * @route   GET /api/validations/statistics
 * @desc    Get validation statistics
 * @access  Private
 */
router.get('/statistics', validationController.getStatistics);

/**
 * @route   GET /api/validations/:id
 * @desc    Get validation by ID
 * @access  Private
 */
router.get('/:id', validationController.getValidationById);

/**
 * @route   POST /api/validations/:id/revalidate
 * @desc    Revalidate existing validation
 * @access  Private
 */
router.post('/:id/revalidate', validationRateLimiter, validationController.revalidate);

/**
 * @route   DELETE /api/validations/:id
 * @desc    Delete validation
 * @access  Private
 */
router.delete('/:id', validationController.deleteValidation);

export default router;
