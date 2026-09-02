import { Job } from 'bull';
import prisma from '../src/config/database';
import { ValidationJob } from '../src/queues/validation.queue';
import { processor } from '../src/workers/validation.worker';
import * as tools from '../src/tools';

describe('53. failed tool does not crash the job', () => {
  it('completes the validation when a tool throws', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'demo@local' } });
    expect(user).toBeTruthy();

    const executeSpy = jest.spyOn(tools.grepTool, 'execute').mockImplementation(async () => {
      throw new Error('simulated grep failure');
    });

    const validation = await prisma.validation.create({
      data: {
        userId: user!.id,
        validationType: 'manual',
        status: 'pending',
        totalFiles: 1,
        commitMessage: 'test-mvp-53 failed tool',
      },
    });

    await expect(
      processor.processValidation({
        data: {
          validationId: validation.id,
          userId: user!.id,
          files: [{ fileName: 'ok.js', filePath: 'ok.js', content: 'const x = 1;\n' }],
        },
      } as Job<ValidationJob>)
    ).resolves.toBeUndefined();

    const saved = await prisma.validation.findUnique({ where: { id: validation.id } });
    expect(saved?.status).toBe('success');
    executeSpy.mockRestore();
  });
});
