export interface ToolContext {
  workspaceRoot: string;
}

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface Tool<TInput = Record<string, unknown>> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: TInput, ctx: ToolContext) => Promise<ToolResult>;
}
