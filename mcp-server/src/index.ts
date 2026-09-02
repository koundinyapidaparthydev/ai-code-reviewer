#!/usr/bin/env node
/**
 * Local stdio MCP server. Do not host this.
 * Reuses sandbox tools from ai-code-reviewer-backend/src/tools.
 */
import readline from 'readline';
import path from 'path';
import { MCP_TOOLS, executeTool, ToolContext } from '../../ai-code-reviewer-backend/src/tools';

const root = path.resolve(process.env.MCP_ROOT || process.argv[2] || process.cwd());
const ctx: ToolContext = { workspaceRoot: root };

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string | null;
  method?: string;
  params?: Record<string, unknown>;
}

function write(message: unknown): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id: number | string | null | undefined, payload: unknown): void {
  write({ jsonrpc: '2.0', id: id ?? null, result: payload });
}

function error(id: number | string | null | undefined, code: number, message: string): void {
  write({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
}

async function handle(request: JsonRpcRequest): Promise<void> {
  const { id, method, params } = request;
  if (!method) return;

  if (method === 'initialize') {
    result(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'ai-code-reviewer-mcp', version: '1.0.0' },
    });
    write({ jsonrpc: '2.0', method: 'notifications/initialized' });
    return;
  }

  if (method === 'notifications/initialized' || method === 'initialized') {
    return;
  }

  if (method === 'tools/list') {
    result(id, {
      tools: MCP_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    });
    return;
  }

  if (method === 'tools/call') {
    const name = String(params?.name || '');
    const args = (params?.arguments as Record<string, unknown>) || {};
    const allowed = MCP_TOOLS.some((tool) => tool.name === name);
    if (!allowed) {
      error(id, -32601, `Unknown or disallowed tool: ${name}`);
      return;
    }
    const output = await executeTool(name, args, ctx);
    result(id, {
      content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
      isError: !output.ok,
    });
    return;
  }

  if (method === 'ping') {
    result(id, {});
    return;
  }

  error(id, -32601, `Method not found: ${method}`);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let parsed: JsonRpcRequest;
  try {
    parsed = JSON.parse(trimmed) as JsonRpcRequest;
  } catch {
    error(null, -32700, 'Parse error');
    return;
  }
  handle(parsed).catch((err) => {
    error(parsed.id ?? null, -32603, err instanceof Error ? err.message : 'Internal error');
  });
});

process.stderr.write(`mcp-server stdio ready root=${root}\n`);
