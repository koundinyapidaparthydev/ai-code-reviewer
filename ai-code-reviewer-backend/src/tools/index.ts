import { Tool, ToolContext, ToolResult } from './types';
import { readFileTool } from './read_file';
import { grepTool } from './grep';
import { listFilesTool } from './list_files';
import { runLintTool } from './run_lint';
import { gitDiffTool } from './git_diff';

export * from './types';
export * from './sandbox';
export { readFileTool, grepTool, listFilesTool, runLintTool, gitDiffTool };

export const ALL_TOOLS: Tool[] = [
  readFileTool as Tool,
  grepTool as Tool,
  listFilesTool as Tool,
  runLintTool as Tool,
  gitDiffTool as Tool,
];

export const MCP_TOOLS: Tool[] = [
  readFileTool as Tool,
  grepTool as Tool,
  listFilesTool as Tool,
];

const byName = new Map(ALL_TOOLS.map((tool) => [tool.name, tool]));

export function getTool(name: string): Tool | undefined {
  return byName.get(name);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const tool = byName.get(name);
  if (!tool) {
    return { ok: false, error: `Unknown tool: ${name}` };
  }
  try {
    return await tool.execute(input, ctx);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
}

export function previewOutput(data: unknown, max = 800): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
