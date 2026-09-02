import fs from 'fs/promises';
import path from 'path';
import { resolveSafePath, SandboxError, SKIP_DIR_NAMES } from './sandbox';
import { Tool, ToolContext, ToolResult } from './types';

interface RunLintInput {
  path?: string;
}

interface LintIssue {
  file: string;
  line: number;
  rule: string;
  severity: 'low' | 'medium';
  message: string;
  evidence: string;
}

const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

function hasLooseEquality(line: string): boolean {
  let i = 0;
  while (i < line.length - 1) {
    if (line[i] === '=' && line[i + 1] === '=') {
      const prev = i > 0 ? line[i - 1] : '';
      const next = line[i + 2] || '';
      if (prev !== '=' && prev !== '!' && next !== '=') {
        return true;
      }
      i += 2;
      continue;
    }
    i += 1;
  }
  return false;
}

async function collectCodeFiles(dir: string, acc: string[], maxFiles: number): Promise<void> {
  if (acc.length >= maxFiles) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (acc.length >= maxFiles) return;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectCodeFiles(full, acc, maxFiles);
    } else if (entry.isFile() && CODE_EXT.has(path.extname(entry.name).toLowerCase())) {
      acc.push(full);
    }
  }
}

export const runLintTool: Tool<RunLintInput> = {
  name: 'run_lint',
  description:
    'Run a built-in read-only style linter on JavaScript/TypeScript files in the workspace. Does not execute project code.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative file or directory (default .)' },
    },
  },
  async execute(input: RunLintInput, ctx: ToolContext): Promise<ToolResult> {
    try {
      const target = resolveSafePath(ctx.workspaceRoot, input.path || '.');
      const stat = await fs.stat(target);
      const files: string[] = [];
      if (stat.isFile()) {
        files.push(target);
      } else {
        await collectCodeFiles(target, files, 80);
      }

      const root = path.resolve(ctx.workspaceRoot);
      const issues: LintIssue[] = [];

      for (const file of files) {
        let content: string;
        try {
          content = await fs.readFile(file, 'utf8');
        } catch {
          continue;
        }
        const rel = path.relative(root, file).split(path.sep).join('/');
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const evidence = line.trim().slice(0, 200);
          if (/\bvar\s+\w+/.test(line)) {
            issues.push({
              file: rel,
              line: i + 1,
              rule: 'no_var',
              severity: 'low',
              message: 'Use let/const instead of var',
              evidence,
            });
          }
          if (hasLooseEquality(line)) {
            issues.push({
              file: rel,
              line: i + 1,
              rule: 'eqeqeq',
              severity: 'low',
              message: 'Prefer === over ==',
              evidence,
            });
          }
          if (/\bconsole\.log\s*\(/.test(line)) {
            issues.push({
              file: rel,
              line: i + 1,
              rule: 'no_console',
              severity: 'low',
              message: 'console.log left in source',
              evidence,
            });
          }
        }
      }

      return {
        ok: true,
        data: {
          filesLinted: files.length,
          issueCount: issues.length,
          issues: issues.slice(0, 80),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof SandboxError ? error.message : 'Failed to lint',
      };
    }
  },
};
