import { execSync } from 'child_process';
import path from 'path';

describe('58. compose postgres+redis healthy', () => {
  it('reports postgres and redis as healthy', () => {
    const output = execSync('docker compose ps --format json', {
      cwd: path.resolve(__dirname, '../..'),
      encoding: 'utf8',
    });

    const rows = output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { Service?: string; Health?: string; State?: string });

    const postgres = rows.find((row) => row.Service === 'postgres');
    const redis = rows.find((row) => row.Service === 'redis');
    expect(postgres?.Health || postgres?.State).toMatch(/healthy|running/i);
    expect(redis?.Health || redis?.State).toMatch(/healthy|running/i);
    expect(postgres?.Health).toBe('healthy');
    expect(redis?.Health).toBe('healthy');
  });
});
