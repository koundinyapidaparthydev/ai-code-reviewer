import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolveWorkspaceRoot, SandboxError } from './sandbox';
import { Tool, ToolContext, ToolResult } from './types';

const execFileAsync = promisify(execFile);

interface GitDiffInput {
  path?: string;
}

export const gitDiffTool: Tool<GitDiffInput> = {
  name: 'git_diff',
  description:
    'Read-only git diff for the workspace (no write, push, or delete). Returns empty if the workspace is not a git repo.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Optional relative path to limit the diff (default whole workspace)',
      },
    },
  },
  async execute(input: GitDiffInput, ctx: ToolContext): Promise<ToolResult> {
    try {
      const cwd = resolveWorkspaceRoot(ctx.workspaceRoot);
      const extra = input.path && input.path !== '.' ? ['--', input.path] : [];

      if (input.path) {
        if (input.path.includes('..') || input.path.startsWith('-')) {
          return { ok: false, error: 'Invalid path for git_diff' };
        }
      }

      const { stdout, stderr } = await execFileAsync('git', ['diff', '--no-color', ...extra], {
        cwd,
        timeout: 8000,
        maxBuffer: 512 * 1024,
      });

      return {
        ok: true,
        data: {
          diff: stdout.slice(0, 32 * 1024),
          warning: stderr ? stderr.slice(0, 500) : undefined,
          empty: !stdout.trim(),
        },
      };
    } catch (error) {
      const err = error as { code?: number; stderr?: string; message?: string };
      const message = `${err.stderr || err.message || ''}`.toLowerCase();
      if (message.includes('not a git repository')) {
        return {
          ok: true,
          data: { diff: '', empty: true, note: 'Workspace is not a git repository' },
        };
      }
      if (error instanceof SandboxError) {
        return { ok: false, error: error.message };
      }
      return { ok: false, error: 'git_diff failed' };
    }
  },
};
