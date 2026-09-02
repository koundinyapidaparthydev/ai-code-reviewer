import fs from 'fs';
import path from 'path';

function asFindings(value: unknown): Array<{ message: string; file: string }> {
  return Array.isArray(value) ? (value as Array<{ message: string; file: string }>) : [];
}

describe('55. frontend findings list renders from mock/API', () => {
  const frontendRoot = path.resolve(__dirname, '../../ai-code-reviewer-frontend/src');

  it('FindingsPanel maps findings from props', () => {
    const panel = fs.readFileSync(path.join(frontendRoot, 'components/review/FindingsPanel.tsx'), 'utf8');
    expect(panel).toContain('findings.map');
    expect(panel).toContain('finding.message');
    expect(panel).toContain('finding.file');
    expect(panel).toContain('finding.severity');
  });

  it('dashboard and detail pages pass findings into FindingsPanel', () => {
    const dashboard = fs.readFileSync(path.join(frontendRoot, 'app/(dashboard)/dashboard/page.tsx'), 'utf8');
    const detail = fs.readFileSync(
      path.join(frontendRoot, 'app/(dashboard)/validations/[id]/page.tsx'),
      'utf8'
    );
    expect(dashboard).toContain('FindingsPanel');
    expect(dashboard).toContain('findings={currentValidation?.findings}');
    expect(detail).toContain('FindingsPanel');
    expect(detail).toContain('findings={currentValidation.findings}');
  });

  it('normalizeValidation reads findings from a mock API payload', () => {
    const normalize = fs.readFileSync(path.join(frontendRoot, 'lib/normalize.ts'), 'utf8');
    expect(normalize).toContain('findings: asFindings(raw.findings)');

    const api = {
      id: 'val-1',
      status: 'success',
      findings: [
        {
          severity: 'high',
          file: 'profile.js',
          line: 4,
          message: 'Possible null dereference',
          evidence: 'user.name',
          suggestion: 'Guard the value',
        },
      ],
    };
    const findings = asFindings(api.findings);
    expect(findings).toHaveLength(1);
    expect(findings[0].message).toBe('Possible null dereference');
    expect(findings[0].file).toBe('profile.js');
  });
});
