import { hasOpenAIKey } from '../src/config';
import agentService from '../src/services/agent.service';
import { deterministicReview } from '../src/services/deterministic.reviewer';
import { fixtureInput } from './helpers';

describe('44. sandbox reviewer works without OpenAI', () => {
  it('treats the configured placeholder key as missing', () => {
    expect(hasOpenAIKey(process.env.OPENAI_API_KEY)).toBe(false);
    expect(hasOpenAIKey('')).toBe(false);
    expect(hasOpenAIKey('your-openai-api-key')).toBe(false);
  });

  it('deterministicReview produces findings without calling OpenAI', async () => {
    const result = await deterministicReview(fixtureInput('01-null-deref'));
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.toolCalls.length).toBeGreaterThan(0);
    expect(result.summary).toMatch(/deterministic/i);
  });

  it('AgentService falls back to the sandbox reviewer', async () => {
    const result = await agentService.reviewWorkspace(fixtureInput('03-leaked-secret'));
    expect(result.reviewMode).toBe('deterministic');
    expect(result.findings.some((finding) => finding.rule === 'leaked_secret')).toBe(true);
  });
});
