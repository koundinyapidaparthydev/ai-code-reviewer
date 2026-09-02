import {
  ALL_TOOLS,
  executeTool,
  readFileTool,
  grepTool,
  listFilesTool,
  runLintTool,
  gitDiffTool,
} from '../src/tools';
import { makeWorkspace } from './helpers';

const OUTSIDE = ['../outside.txt', '../../etc/passwd', '/etc/passwd', '..'];

describe('41. each tool rejects paths outside workspace', () => {
  const workspace = makeWorkspace({ 'ok.js': 'const n = 1;\n' });

  it('registers the five read-only tools', () => {
    expect(ALL_TOOLS.map((tool) => tool.name).sort()).toEqual(
      ['git_diff', 'grep', 'list_files', 'read_file', 'run_lint'].sort()
    );
  });

  it.each(ALL_TOOLS.map((tool) => [tool.name]))(
    '%s rejects traversal and absolute paths',
    async (name) => {
      for (const bad of OUTSIDE) {
        const result = await executeTool(name, { path: bad, pattern: 'n' }, { workspaceRoot: workspace });
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/path|absolute|traversal|invalid/i);
      }
    }
  );

  it('named tool exports also reject traversal', async () => {
    const ctx = { workspaceRoot: workspace };
    const tools = [readFileTool, grepTool, listFilesTool, runLintTool, gitDiffTool];
    for (const tool of tools) {
      const result = await tool.execute(
        { path: '../../../etc/passwd', pattern: 'x' },
        ctx
      );
      expect(result.ok).toBe(false);
    }
  });
});
