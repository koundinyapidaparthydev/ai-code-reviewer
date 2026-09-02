import fs from 'fs/promises';
import prisma from '../config/database';
import validationQueue from '../queues/validation.queue';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { copyFilesIntoWorkspace } from '../tools/workspace';
import { config } from '../config';

export class ValidationService {
  async createManualValidation(
    userId: string,
    files: Express.Multer.File[]
  ) {
    try {
      if (!files || files.length === 0) {
        throw new AppError(400, 'No files provided');
      }

      // Create validation record
      const validation = await prisma.validation.create({
        data: {
          userId,
          validationType: 'manual',
          status: 'pending',
          totalFiles: files.length,
        },
      });

      const fileContents = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(file.path, 'utf-8');
          return {
            fileName: file.originalname,
            filePath: file.path,
            content,
          };
        })
      );

      const workspacePath = await copyFilesIntoWorkspace(
        validation.id,
        files.map((file) => ({
          originalName: file.originalname,
          diskPath: file.path,
        }))
      );

      await prisma.validation.update({
        where: { id: validation.id },
        data: {
          workspacePath,
          reviewMode: config.review.mode,
        },
      });

      await validationQueue.add({
        validationId: validation.id,
        userId,
        workspacePath,
        files: fileContents,
      });

      logger.info(
        `Manual validation ${validation.id} created with ${files.length} files`
      );

      // Clean up uploaded files after reading
      setTimeout(async () => {
        for (const file of files) {
          try {
            await fs.unlink(file.path);
          } catch (error) {
            logger.error(`Failed to delete file ${file.path}:`, error);
          }
        }
      }, 5000);

      return validation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to create manual validation:', error);
      throw new AppError(500, 'Failed to create validation');
    }
  }

  async getValidations(userId: string, limit = 20, offset = 0) {
    try {
      const [validations, total] = await Promise.all([
        prisma.validation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            repository: {
              select: {
                name: true,
                fullName: true,
              },
            },
            _count: {
              select: {
                fileResults: true,
              },
            },
          },
        }),
        prisma.validation.count({
          where: { userId },
        }),
      ]);

      return {
        validations,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      logger.error('Failed to fetch validations:', error);
      throw new AppError(500, 'Failed to fetch validations');
    }
  }

  async getValidationById(validationId: string, userId: string) {
    try {
      const validation = await prisma.validation.findFirst({
        where: {
          id: validationId,
          userId,
        },
        include: {
          repository: true,
          fileResults: {
            orderBy: { score: 'asc' },
          },
        },
      });

      if (!validation) {
        throw new AppError(404, 'Validation not found');
      }

      return validation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch validation:', error);
      throw new AppError(500, 'Failed to fetch validation');
    }
  }

  async revalidate(validationId: string, userId: string) {
    try {
      const validation = await prisma.validation.findFirst({
        where: {
          id: validationId,
          userId,
        },
        include: {
          fileResults: true,
        },
      });

      if (!validation) {
        throw new AppError(404, 'Validation not found');
      }

      if (validation.status === 'processing') {
        throw new AppError(400, 'Validation is already in progress');
      }

      // Create new validation
      const newValidation = await prisma.validation.create({
        data: {
          userId,
          validationType: validation.validationType,
          status: 'pending',
          repositoryId: validation.repositoryId,
          commitHash: validation.commitHash,
          commitMessage: validation.commitMessage,
          commitAuthor: validation.commitAuthor,
          branch: validation.branch,
          totalFiles: validation.totalFiles,
        },
      });

      // Extract file data from previous validation
      // Note: File content is not stored in the new schema
      // You would need to re-fetch files from repository or storage
      const files = validation.fileResults.map((fr) => ({
        fileName: fr.fileName,
        filePath: fr.filePath,
        content: '', // Content not stored, needs to be fetched
      }));

      // Add to queue
      await validationQueue.add({
        validationId: newValidation.id,
        userId,
        files,
      });

      logger.info(`Revalidation ${newValidation.id} created for validation ${validationId}`);

      return newValidation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to revalidate:', error);
      throw new AppError(500, 'Failed to revalidate');
    }
  }

  async deleteValidation(validationId: string, userId: string) {
    try {
      const validation = await prisma.validation.findFirst({
        where: {
          id: validationId,
          userId,
        },
      });

      if (!validation) {
        throw new AppError(404, 'Validation not found');
      }

      await prisma.validation.delete({
        where: { id: validationId },
      });

      logger.info(`Validation ${validationId} deleted`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to delete validation:', error);
      throw new AppError(500, 'Failed to delete validation');
    }
  }

  async getStatistics(userId: string) {
    try {
      const [total, completed, failed, avgScore] = await Promise.all([
        prisma.validation.count({ where: { userId } }),
        prisma.validation.count({
          where: { userId, status: 'completed' },
        }),
        prisma.validation.count({
          where: { userId, status: 'failed' },
        }),
        prisma.validation.aggregate({
          where: { userId, status: 'completed' },
          _avg: { overallScore: true },
        }),
      ]);

      const recentValidations = await prisma.validation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          overallScore: true,
          totalFiles: true,
          createdAt: true,
        },
      });

      return {
        total,
        completed,
        failed,
        pending: total - completed - failed,
        averageScore: avgScore._avg.overallScore || 0,
        recentValidations,
      };
    } catch (error) {
      logger.error('Failed to fetch statistics:', error);
      throw new AppError(500, 'Failed to fetch statistics');
    }
  }
}

export default new ValidationService();
