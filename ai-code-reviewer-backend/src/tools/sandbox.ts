import fs from 'fs';
import path from 'path';

export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SandboxError';
  }
}

export function resolveWorkspaceRoot(workspaceRoot: string): string {
  if (!workspaceRoot || !workspaceRoot.trim()) {
    throw new SandboxError('Workspace root is required');
  }
  const root = path.resolve(workspaceRoot);
  if (!fs.existsSync(root)) {
    throw new SandboxError('Workspace root does not exist');
  }
  const stat = fs.statSync(root);
  if (!stat.isDirectory()) {
    throw new SandboxError('Workspace root is not a directory');
  }
  return root;
}

/**
 * Resolve a user-supplied path so it can ONLY point inside workspaceRoot.
 * Rejects absolute paths, Windows drive paths, and `..` traversal.
 */
export function resolveSafePath(workspaceRoot: string, requestedPath = '.'): string {
  const root = resolveWorkspaceRoot(workspaceRoot);
  const raw = requestedPath == null ? '.' : String(requestedPath);

  if (raw.trim() === '') {
    return root;
  }

  if (path.isAbsolute(raw) || /^[a-zA-Z]:[\\/]/.test(raw)) {
    throw new SandboxError('Absolute paths are not allowed');
  }

  if (raw.includes('\0')) {
    throw new SandboxError('Invalid path');
  }

  const target = path.resolve(root, raw);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new SandboxError('Path traversal rejected');
  }

  return target;
}

export function assertInsideWorkspace(workspaceRoot: string, targetPath: string): void {
  resolveSafePath(workspaceRoot, path.relative(path.resolve(workspaceRoot), path.resolve(targetPath)));
}

export const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
]);
