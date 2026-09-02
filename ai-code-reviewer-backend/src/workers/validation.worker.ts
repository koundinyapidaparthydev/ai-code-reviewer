import { Job } from 'bull';
import { Prisma } from '@prisma/client';
import validationQueue, { ValidationJob } from '../queues/validation.queue';
import prisma from '../config/database';
import { config } from '../config';
import agentService from '../services/agent.service';
import notificationService from '../services/notification.service';
import { io } from '../websocket';
import logger from '../utils/logger';
import { createJobWorkspace } from '../tools/workspace';

function emitSafe(userId: string, event: string, payload: unknown): void {
  try {
    io?.to(userId).emit(event, payload);
  } catch {
    // WebSocket may be uninitialized in worker-only or test runs
  }
}

export class ValidationProcessor {
  async processValidation(job: Job<ValidationJob>): Promise<void> {
    const { validationId, userId, files } = job.data;
    let workspacePath = job.data.workspacePath;

    try {
      logger.info(`Processing validation ${validationId} with ${files.length} files`);

      await prisma.validation.update({
        where: { id: validationId },
        data: { status: 'processing' },
      });

      emitSafe(userId, 'validation:started', { validationId });

      if (!workspacePath) {
        workspacePath = await createJobWorkspace(
          validationId,
          files.map((file) => ({
            fileName: file.fileName,
            content: file.content,
            relativePath: file.fileName,
          }))
        );
      }

      const startTime = Date.now();
      const useTools = config.review.mode !== 'legacy';

      const review = useTools
        ? await agentService.reviewWorkspace(workspacePath)
        : await agentService.reviewWorkspace(workspacePath, 'legacy');

      const fileGroups = new Map<string, typeof review.findings>();
      for (const finding of review.findings) {
        const key = finding.file || 'unknown';
        const list = fileGroups.get(key) || [];
        list.push(finding);
        fileGroups.set(key, list);
      }

      if (fileGroups.size === 0 && files.length > 0) {
        for (const file of files) {
          fileGroups.set(file.fileName, []);
        }
      }

      await Promise.all(
        Array.from(fileGroups.entries()).map(([fileName, findings]) =>
          prisma.fileResult.create({
            data: {
              validationId,
              fileName,
              filePath: fileName,
              fileExtension: this.getFileExtension(fileName),
              aiAnalysis: findings.map((f) => f.message).join('; ') || review.summary,
              score: review.score,
              issues: findings as unknown as Prisma.InputJsonValue,
              recommendations: findings.map((f) => f.suggestion).filter(Boolean) as unknown as Prisma.InputJsonValue,
              status: 'success',
            },
          })
        )
      );

      const processingTime = Date.now() - startTime;

      await prisma.validation.update({
        where: { id: validationId },
        data: {
          status: 'success',
          totalFiles: files.length,
          filesProcessed: files.length,
          overallScore: review.score,
          aiSummary: review.summary,
          findings: review.findings as unknown as Prisma.InputJsonValue,
          toolCalls: review.toolCalls as unknown as Prisma.InputJsonValue,
          reviewMode: review.reviewMode,
          workspacePath,
          processingTimeMs: processingTime,
          completedAt: new Date(),
        },
      });

      await notificationService.createNotification({
        userId,
        type: 'success',
        title: 'Validation Completed',
        message: `Your code validation is complete. Overall score: ${review.score.toFixed(1)}/100`,
        actionUrl: `/validations/${validationId}`,
      });

      emitSafe(userId, 'validation:completed', {
        validationId,
        overallScore: review.score,
        filesAnalyzed: files.length,
        findings: review.findings,
        toolCalls: review.toolCalls,
      });

      logger.info(
        `Validation ${validationId} completed successfully in ${processingTime}ms`
      );
    } catch (error) {
      logger.error(`Validation ${validationId} failed:`, error);

      await prisma.validation.update({
        where: { id: validationId },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      });

      await notificationService.createNotification({
        userId,
        type: 'error',
        title: 'Validation Failed',
        message: 'An error occurred while validating your code. Please try again.',
        actionUrl: `/validations/${validationId}`,
      });

      emitSafe(userId, 'validation:failed', {
        validationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }
}

export const processor = new ValidationProcessor();

if (process.env.START_QUEUE_WORKER !== '0') {
  validationQueue.process(async (job) => {
    await processor.processValidation(job);
  });
}

export default validationQueue;
