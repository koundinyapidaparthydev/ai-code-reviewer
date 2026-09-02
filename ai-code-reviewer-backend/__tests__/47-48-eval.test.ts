import fs from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { runEval } from '../src/eval/run';
import { reportPath } from '../src/eval/load';

describe('47–48. eval report', () => {
  it('47. npm run eval exits 0 and writes a report', () => {
    const result = spawnSync('npm', ['run', 'eval'], {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain('sk-live-demo-not-a-real-key-123456');
    expect(result.stdout).not.toContain('SuperSecret123');
    expect(fs.existsSync(reportPath())).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath(), 'utf8'));
    expect(report.fixtureCount).toBeGreaterThan(0);
    expect(report).toHaveProperty('precision');
  });

  it('48. precision is a number in [0,1]', async () => {
    const report = await runEval();
    expect(typeof report.precision).toBe('number');
    expect(Number.isNaN(report.precision)).toBe(false);
    expect(report.precision).toBeGreaterThanOrEqual(0);
    expect(report.precision).toBeLessThanOrEqual(1);
    expect(report.recall).toBeGreaterThanOrEqual(0);
    expect(report.recall).toBeLessThanOrEqual(1);
  });
});
