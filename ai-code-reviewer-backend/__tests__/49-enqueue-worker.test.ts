import fs from 'fs';
import path from 'path';
import { Job } from 'bull';
import prisma from '../src/config/database';
import validationQueue, { ValidationJob } from '../src/queues/validation.queue';
import { processor } from '../src/workers/validation.worker';
import { fixtureInput } from './helpers';

describe('49. enqueue validation on fixture 1, worker produces findings', () => {
  it('enqueues fixture 01 and the worker persists findings', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'demo@local' } });
    expect(user).toBeTruthy();

    const inputDir = fixtureInput('01-null-deref');
    const fileName = 'profile.js';
    const content = fs.readFileSync(path.join(inputDir, fileName), 'utf8');

    const validation = await prisma.validation.create({
      data: {
        userId: user!.id,
        validationType: 'manual',
        status: 'pending',
        totalFiles: 1,
        commitMessage: 'test-mvp-49 fixture 01',
      },
    });

    const jobData: ValidationJob = {
      validationId: validation.id,
      userId: user!.id,
      files: [{ fileName, filePath: fileName, content }],
    };

    const queued = await validationQueue.add(jobData);
    expect(queued.id).toBeDefined();

    await processor.processValidation({ data: jobData } as Job<ValidationJob>);

    const saved = await prisma.validation.findUnique({ where: { id: validation.id } });
    expect(saved?.status).toBe('success');
    const findings = (saved?.findings as Array<{ message?: string }>) || [];
    expect(findings.length).toBeGreaterThan(0);
    expect(JSON.stringify(findings).toLowerCase()).toMatch(/null|deref|undefined/);
  });
});
