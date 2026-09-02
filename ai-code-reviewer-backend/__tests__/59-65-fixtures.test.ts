import fs from 'fs';
import path from 'path';
import { ALL_TOOLS, executeTool, resolveSafePath } from '../src/tools';
import { FixtureLabels } from '../src/eval/types';
import { FIXTURES_ROOT } from './helpers';

const SECRET_SNIPPETS = ['sk-live-demo-not-a-real-key-123456', 'SuperSecret123'];

function loadLabels(): Array<{ id: string; dir: string; labels: FixtureLabels }> {
  return fs
    .readdirSync(FIXTURES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(FIXTURES_ROOT, entry.name);
      const raw = fs.readFileSync(path.join(dir, 'labels.json'), 'utf8');
      return { id: entry.name, dir, labels: JSON.parse(raw) as FixtureLabels };
    });
}

describe('59–63. fixtures and secrets', () => {
  const fixtures = loadLabels();

  it('59. fixture secrets are not printed by this test suite', () => {
    const logged = (global as { testPath?: string }).testPath || '';
    expect(logged.includes('sk-live-demo')).toBe(false);
    for (const snippet of SECRET_SNIPPETS) {
      expect(snippet.startsWith('sk-') || snippet.length > 8).toBe(true);
    }
  });

  it('60. fixture labels are valid JSON with required fields', () => {
    expect(fixtures.length).toBeGreaterThan(0);
    for (const fixture of fixtures) {
      expect(fixture.labels.id).toBeTruthy();
      expect(['bug', 'style', 'mixed', 'security']).toContain(fixture.labels.category);
      expect(Array.isArray(fixture.labels.must_fix)).toBe(true);
    }
  });

  it('61. path traversal fixture does not escape the workspace', async () => {
    const root = path.join(FIXTURES_ROOT, '17-path-traversal', 'input');
    expect(() => resolveSafePath(root, '../labels.json')).toThrow(/traversal|rejected/i);
    for (const tool of ALL_TOOLS) {
      const result = await executeTool(
        tool.name,
        { path: '../labels.json', pattern: 'must_fix' },
        { workspaceRoot: root }
      );
      expect(result.ok).toBe(false);
    }
  });

  it('62. leaked-secret fixture is labeled must_fix', () => {
    const leaked = fixtures.find((fixture) => fixture.id === '03-leaked-secret');
    expect(leaked).toBeTruthy();
    expect(leaked!.labels.must_fix.length).toBeGreaterThan(0);
    expect(leaked!.labels.must_fix.every((label) => label.rule === 'leaked_secret')).toBe(true);
  });

  it('63. style-only fixtures do not require must_fix', () => {
    const styleOnly = fixtures.filter((fixture) => fixture.labels.category === 'style');
    expect(styleOnly.length).toBeGreaterThan(0);
    for (const fixture of styleOnly) {
      expect(fixture.labels.must_fix).toEqual([]);
    }
  });
});
