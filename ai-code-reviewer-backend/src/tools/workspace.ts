import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { resolveSafePath } from './sandbox';

export function workspaceDirFor(validationId: string): string {
  return path.resolve(config.upload.uploadDir, 'workspaces', validationId);
}

export async function createJobWorkspace(
  validationId: string,
  files: Array<{ fileName: string; content: string; relativePath?: string }>
): Promise<string> {
  const root = workspaceDirFor(validationId);
  await fs.mkdir(root, { recursive: true });

  for (const file of files) {
    const safeName = path.basename(file.relativePath || file.fileName);
    if (!safeName || safeName === '.' || safeName === '..') {
      continue;
    }
    const dest = resolveSafePath(root, safeName);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, file.content, 'utf8');
  }

  return root;
}

export async function copyFilesIntoWorkspace(
  validationId: string,
  files: Array<{ originalName: string; diskPath: string }>
): Promise<string> {
  const root = workspaceDirFor(validationId);
  await fs.mkdir(root, { recursive: true });

  for (const file of files) {
    const safeName = path.basename(file.originalName);
    const dest = resolveSafePath(root, safeName);
    await fs.copyFile(file.diskPath, dest);
  }

  return root;
}

export async function removeJobWorkspace(validationId: string): Promise<void> {
  const root = workspaceDirFor(validationId);
  await fs.rm(root, { recursive: true, force: true });
}
