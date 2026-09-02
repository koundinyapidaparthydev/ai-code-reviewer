import fs from 'fs';
import os from 'os';
import path from 'path';

export const FIXTURES_ROOT = path.resolve(__dirname, '../../fixtures/eval');

export function fixtureInput(id: string): string {
  return path.join(FIXTURES_ROOT, id, 'input');
}

export function makeWorkspace(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-ws-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content, 'utf8');
  }
  return dir;
}
