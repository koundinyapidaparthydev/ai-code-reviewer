import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { FixtureLabels, LoadedFixture } from './types';

export function fixturesRoot(): string {
  return process.env.EVAL_FIXTURES_PATH || config.eval.fixturesPath;
}

export function reportPath(): string {
  return process.env.EVAL_REPORT_PATH || config.eval.reportPath;
}

export async function loadFixtures(root = fixturesRoot()): Promise<LoadedFixture[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const fixtures: LoadedFixture[] = [];
  for (const name of dirs) {
    const dir = path.join(root, name);
    const inputDir = path.join(dir, 'input');
    const labelsPath = path.join(dir, 'labels.json');
    const raw = await fs.readFile(labelsPath, 'utf8');
    const labels = JSON.parse(raw) as FixtureLabels;
    fixtures.push({
      id: labels.id || name,
      dir,
      inputDir,
      labels,
    });
  }
  return fixtures;
}
