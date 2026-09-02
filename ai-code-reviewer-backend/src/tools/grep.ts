import fs from 'fs/promises';
import path from 'path';
import { resolveSafePath, SandboxError, SKIP_DIR_NAMES } from './sandbox';
import { Tool, ToolContext, ToolResult } from './types';

interface GrepInput {
  pattern?: string;
  path?: string;
  maxMatches?: number;
}

interface GrepMatch {
  file: string;
  line: number;
  text: string;
}

async function walkFiles(dir: string, root: string, acc: string[], maxFiles: number): Promise<void> {
  if (acc.length >= maxFiles) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (acc.length >= maxFiles) return;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(full, root, acc, maxFiles);
    } else if (entry.isFile()) {
      acc.push(full);
    }
  }
}

export const grepTool: Tool<GrepInput> = {
  name: 'grep',
  description:
    'Search file contents in the workspace with a JavaScript regular expression. Read-only.',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: { type: 'string', description: 'JavaScript regex source (no slashes)' },
      path: { type: 'string', description: 'Relative file or directory to search (default .)' },
      maxMatches: { type: 'number', description: 'Max matches (default 50)' },
    },
    required: ['pattern'],
  },
  async execute(input: GrepInput, ctx: ToolContext): Promise<ToolResult> {
    try {
      if (!input.pattern) {
        return { ok: false, error: 'pattern is required' };
      }

      let regex: RegExp;
      try {
        regex = new RegExp(input.pattern, 'g');
      } catch {
        return { ok: false, error: 'Invalid regular expression' };
      }

      const target = resolveSafePath(ctx.workspaceRoot, input.path || '.');
      const stat = await fs.stat(target);
      const files: string[] = [];
      if (stat.isFile()) {
        files.push(target);
      } else if (stat.isDirectory()) {
        await walkFiles(target, path.resolve(ctx.workspaceRoot), files, 200);
      } else {
        return { ok: false, error: 'Path is not a file or directory' };
      }

      const maxMatches = Math.min(Number(input.maxMatches) || 50, 200);
      const matches: GrepMatch[] = [];
      const root = path.resolve(ctx.workspaceRoot);

      for (const file of files) {
        if (matches.length >= maxMatches) break;
        let content: string;
        try {
          content = await fs.readFile(file, 'utf8');
        } catch {
          continue;
        }
        const lines = content.split(/\r?\n/);
        const rel = path.relative(root, file).split(path.sep).join('/');
        for (let i = 0; i < lines.length; i++) {
          regex.lastIndex = 0;
          if (regex.test(lines[i])) {
            matches.push({
              file: rel,
              line: i + 1,
              text: lines[i].trim().slice(0, 240),
            });
            if (matches.length >= maxMatches) break;
          }
        }
      }

      return {
        ok: true,
        data: {
          pattern: input.pattern,
          matchCount: matches.length,
          truncated: matches.length >= maxMatches,
          matches,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof SandboxError ? error.message : 'Failed to grep',
      };
    }
  },
};
