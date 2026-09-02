import { grepTool } from '../src/tools';
import { makeWorkspace } from './helpers';

describe('42. grep cap respected', () => {
  it('returns at most maxMatches', async () => {
    const lines = Array.from({ length: 80 }, (_, i) => `TODO item ${i}`).join('\n');
    const workspace = makeWorkspace({ 'notes.txt': lines });
    const result = await grepTool.execute(
      { pattern: 'TODO', path: '.', maxMatches: 7 },
      { workspaceRoot: workspace }
    );

    expect(result.ok).toBe(true);
    const data = result.data as { matchCount: number; truncated: boolean; matches: unknown[] };
    expect(data.matchCount).toBe(7);
    expect(data.matches).toHaveLength(7);
    expect(data.truncated).toBe(true);
  });

  it('hard-caps maxMatches at 200', async () => {
    const lines = Array.from({ length: 250 }, (_, i) => `match ${i}`).join('\n');
    const workspace = makeWorkspace({ 'big.txt': lines });
    const result = await grepTool.execute(
      { pattern: 'match', path: '.', maxMatches: 9999 },
      { workspaceRoot: workspace }
    );

    expect(result.ok).toBe(true);
    const data = result.data as { matchCount: number; matches: unknown[] };
    expect(data.matchCount).toBeLessThanOrEqual(200);
    expect(data.matches.length).toBeLessThanOrEqual(200);
  });
});
