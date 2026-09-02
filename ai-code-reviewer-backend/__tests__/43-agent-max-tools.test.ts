const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}));

import { MAX_TOOL_CALLS, runToolAgent } from '../src/services/agent.service';
import { fixtureInput } from './helpers';

describe('43. agent loop stops at max tool calls', () => {
  it('caps tool executions at MAX_TOOL_CALLS', async () => {
    expect(MAX_TOOL_CALLS).toBe(8);

    mockCreate.mockImplementation(async (args: { tools?: unknown }) => {
      if (!args.tools) {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({ summary: 'stopped', findings: [] }),
              },
            },
          ],
        };
      }
      return {
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: `call-${Math.random()}`,
                  function: { name: 'list_files', arguments: '{"path":"."}' },
                },
                {
                  id: `call-${Math.random()}`,
                  function: { name: 'grep', arguments: '{"pattern":"const","path":"."}' },
                },
              ],
            },
          },
        ],
      };
    });

    const result = await runToolAgent(fixtureInput('01-null-deref'));
    expect(result.toolCalls.length).toBeLessThanOrEqual(MAX_TOOL_CALLS);
    expect(result.reviewMode).toBe('tools');
  });
});
