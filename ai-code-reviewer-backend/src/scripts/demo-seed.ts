import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { config } from '../config';
import agentService from '../services/agent.service';
import { createJobWorkspace } from '../tools/workspace';
import { loadFixtures } from '../eval/load';

const DEMO_EMAIL = 'demo@local';
const DEMO_PASSWORD = 'demo-password';

async function main() {
  const fixtures = await loadFixtures();
  const first = fixtures.find((fixture) => fixture.id.startsWith('01')) || fixtures[0];
  if (!first) {
    throw new Error('No eval fixtures found');
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, name: 'Demo User', isActive: true },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Demo User',
      settings: {
        create: {
          emailNotifications: true,
          notificationFrequency: 'realtime',
        },
      },
    },
  });

  const inputFiles = await fs.readdir(first.inputDir);
  const files = await Promise.all(
    inputFiles.map(async (name) => ({
      fileName: name,
      content: await fs.readFile(path.join(first.inputDir, name), 'utf8'),
    }))
  );

  const validation = await prisma.validation.create({
    data: {
      userId: user.id,
      validationType: 'manual',
      status: 'processing',
      totalFiles: files.length,
      commitMessage: `Demo seed from ${first.id}`,
      reviewMode: config.review.mode,
    },
  });

  const workspacePath = await createJobWorkspace(validation.id, files);
  const review = await agentService.reviewWorkspace(workspacePath);

  const byFile = new Map<string, typeof review.findings>();
  for (const finding of review.findings) {
    const list = byFile.get(finding.file) || [];
    list.push(finding);
    byFile.set(finding.file, list);
  }

  for (const file of files) {
    const findings = byFile.get(file.fileName) || [];
    await prisma.fileResult.create({
      data: {
        validationId: validation.id,
        fileName: file.fileName,
        filePath: file.fileName,
        fileExtension: path.extname(file.fileName).replace('.', ''),
        aiAnalysis: findings.map((f) => f.message).join('; ') || review.summary,
        score: review.score,
        issues: findings as unknown as Prisma.InputJsonValue,
        recommendations: findings.map((f) => f.suggestion) as unknown as Prisma.InputJsonValue,
        status: 'success',
      },
    });
  }

  await prisma.validation.update({
    where: { id: validation.id },
    data: {
      status: 'success',
      filesProcessed: files.length,
      overallScore: review.score,
      aiSummary: review.summary,
      findings: review.findings as unknown as Prisma.InputJsonValue,
      toolCalls: review.toolCalls as unknown as Prisma.InputJsonValue,
      reviewMode: review.reviewMode,
      workspacePath,
      completedAt: new Date(),
    },
  });

  console.log(`Seeded ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Validation ${validation.id} from fixture ${first.id}`);
  console.log(`Findings: ${review.findings.length}; tools: ${review.toolCalls.map((t) => t.name).join(', ')}`);
}

main()
  .catch((error) => {
    console.error('demo:seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
