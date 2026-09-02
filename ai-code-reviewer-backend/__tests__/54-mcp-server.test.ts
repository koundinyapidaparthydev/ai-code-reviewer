import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';
import { fixtureInput } from './helpers';

function send(child: ChildProcessWithoutNullStreams, payload: unknown): void {
  child.stdin.write(`${JSON.stringify(payload)}\n`);
}

function collectLines(child: ChildProcessWithoutNullStreams, count: number): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const messages: unknown[] = [];
    let buffer = '';
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${count} MCP messages`)), 20000);
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.method === 'notifications/initialized') continue;
          messages.push(parsed);
          if (messages.length >= count) {
            clearTimeout(timer);
            child.stdout.off('data', onData);
            resolve(messages);
          }
        } catch {
          // ignore non-JSON
        }
      }
    };
    child.stdout.on('data', onData);
  });
}

describe('54. MCP server list_tools + grep', () => {
  it('lists tools and greps a fixture directory', async () => {
    const root = fixtureInput('01-null-deref');
    const child = spawn('npx', ['ts-node', 'src/index.ts', root], {
      cwd: path.resolve(__dirname, '../../mcp-server'),
      env: { ...process.env, MCP_ROOT: root },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    try {
      send(child, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
      send(child, {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'grep', arguments: { pattern: 'findUser', path: '.' } },
      });

      const messages = (await collectLines(child, 2)) as Array<{
        id: number;
        result?: { tools?: Array<{ name: string }>; content?: Array<{ text: string }> };
      }>;

      const listed = messages.find((m) => m.id === 1);
      const names = (listed?.result?.tools || []).map((tool) => tool.name).sort();
      expect(names).toEqual(['grep', 'list_files', 'read_file']);

      const grep = messages.find((m) => m.id === 2);
      const text = grep?.result?.content?.[0]?.text || '';
      expect(text).toMatch(/findUser|matchCount|ok/);
    } finally {
      child.kill();
    }
  });
});
