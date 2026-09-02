import fs from 'fs/promises';
import path from 'path';
import { resolveSafePath, SandboxError, SKIP_DIR_NAMES } from './sandbox';
import { Tool, ToolContext, ToolResult } from './types';

interface ListFilesInput {
  path?: string;
  maxEntries?: number;
}

async function walk(
  dir: string,
  root: string,
  acc: string[],
  maxEntries: number
): Promise<void> {
  if (acc.length >= maxEntries) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (acc.length >= maxEntries) return;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (rel.startsWith('..')) continue;
    if (entry.isDirectory()) {
      await walk(full, root, acc, maxEntries);
    } else if (entry.isFile()) {
      acc.push(rel.split(path.sep).join('/'));
    }
  }
}

export const listFilesTool: Tool<ListFilesInput> = {
  name: 'list_files',
  description: 'List files under a workspace subdirectory (read-only).',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative directory (default .)' },
      maxEntries: { type: 'number', description: 'Max files to return (default 200)' },
    },
  },
  async execute(input: ListFilesInput, ctx: ToolContext): Promise<ToolResult> {
    try {
      const target = resolveSafePath(ctx.workspaceRoot, input.path || '.');
      const stat = await fs.stat(target);
      if (!stat.isDirectory()) {
        return { ok: false, error: 'Path is not a directory' };
      }
      const maxEntries = Math.min(Number(input.maxEntries) || 200, 500);
      const files: string[] = [];
      await walk(target, path.resolve(ctx.workspaceRoot), files, maxEntries);
      files.sort();
      return {
        ok: true,
        data: {
          root: path.relative(path.resolve(ctx.workspaceRoot), target) || '.',
          count: files.length,
          truncated: files.length >= maxEntries,
          files,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof SandboxError ? error.message : 'Failed to list files',
      };
    }
  },
};
