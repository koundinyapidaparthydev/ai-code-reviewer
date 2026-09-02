import fs from 'fs/promises';
import path from 'path';
import { resolveSafePath, SandboxError } from './sandbox';
import { Tool, ToolContext, ToolResult } from './types';

interface ReadFileInput {
  path?: string;
  maxBytes?: number;
}

const DEFAULT_MAX_BYTES = 64 * 1024;

export const readFileTool: Tool<ReadFileInput> = {
  name: 'read_file',
  description:
    'Read a text file from the job workspace. Path is relative to the workspace root.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative file path inside the workspace' },
      maxBytes: { type: 'number', description: 'Optional max bytes to read (default 65536)' },
    },
    required: ['path'],
  },
  async execute(input: ReadFileInput, ctx: ToolContext): Promise<ToolResult> {
    try {
      const filePath = resolveSafePath(ctx.workspaceRoot, input.path || '');
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        return { ok: false, error: 'Path is not a file' };
      }

      const maxBytes = Math.min(
        Number(input.maxBytes) > 0 ? Number(input.maxBytes) : DEFAULT_MAX_BYTES,
        256 * 1024
      );
      const handle = await fs.open(filePath, 'r');
      try {
        const buf = Buffer.alloc(Math.min(stat.size, maxBytes));
        const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
        const text = buf.subarray(0, bytesRead).toString('utf8');
        const lines = text.split(/\r?\n/);
        return {
          ok: true,
          data: {
            path: path.relative(path.resolve(ctx.workspaceRoot), filePath),
            bytes: bytesRead,
            truncated: stat.size > bytesRead,
            lineCount: lines.length,
            content: text,
          },
        };
      } finally {
        await handle.close();
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof SandboxError ? error.message : 'Failed to read file',
      };
    }
  },
};
