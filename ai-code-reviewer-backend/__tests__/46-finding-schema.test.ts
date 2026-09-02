import { findingSchema, validateFinding } from '../src/types/finding';

describe('46. finding schema validation', () => {
  const valid = {
    severity: 'high',
    file: 'profile.js',
    line: 4,
    message: 'Possible null/undefined dereference',
    evidence: 'user.name',
    suggestion: 'Guard the value',
    rule: 'null_deref',
  };

  it('accepts a complete finding', () => {
    const result = validateFinding(valid);
    expect(result.ok).toBe(true);
    expect(findingSchema.parse(valid).severity).toBe('high');
  });

  it('accepts a null line', () => {
    expect(validateFinding({ ...valid, line: null }).ok).toBe(true);
  });

  it('rejects an unknown severity', () => {
    const result = validateFinding({ ...valid, severity: 'urgent' });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing message', () => {
    const { message, ...rest } = valid;
    expect(validateFinding(rest).ok).toBe(false);
  });

  it('rejects a non-integer line', () => {
    expect(validateFinding({ ...valid, line: 1.5 }).ok).toBe(false);
  });
});
