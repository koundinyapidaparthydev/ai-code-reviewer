import agentService, { runLegacyDump } from '../src/services/agent.service';
import { fixtureInput } from './helpers';

jest.mock('../src/services/ai.service', () => ({
  __esModule: true,
  default: {
    validateMultipleFiles: jest.fn().mockResolvedValue([
      {
        fileName: 'profile.js',
        filePath: 'profile.js',
        score: 70,
        issues: [
          {
            severity: 'high',
            line: 4,
            message: 'Possible null dereference',
            suggestion: 'Guard the value',
          },
        ],
      },
    ]),
    generateSummary: jest.fn().mockResolvedValue('Legacy dump summary'),
  },
}));

describe('45. legacy mode still callable', () => {
  it('reviewWorkspace accepts legacy mode without throwing', async () => {
    const result = await agentService.reviewWorkspace(fixtureInput('01-null-deref'), 'legacy');
    expect(result).toBeDefined();
    expect(['legacy', 'deterministic']).toContain(result.reviewMode);
    expect(Array.isArray(result.findings)).toBe(true);
  });

  it('runLegacyDump is exported and returns a legacy review', async () => {
    const result = await runLegacyDump(fixtureInput('01-null-deref'));
    expect(result.reviewMode).toBe('legacy');
    expect(result.summary).toBe('Legacy dump summary');
    expect(result.findings.length).toBeGreaterThan(0);
  });
});
