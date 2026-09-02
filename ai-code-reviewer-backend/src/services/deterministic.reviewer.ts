import { Finding, FindingSeverity, ToolCallRecord } from '../types/finding';
import { ToolContext, executeTool, previewOutput } from '../tools';

const MAX_TOOL_CALLS = 8;

interface RuleSpec {
  rule: string;
  test: (file: string, line: string) => boolean;
  severity: FindingSeverity;
  message: string;
  suggestion: string;
}

const BUG_RULES: RuleSpec[] = [
  {
    rule: 'null_deref',
    test: (file, line) =>
      /MAYBE_NULL|nullableUser|findUser\(/.test(`${file} ${line}`) &&
      /\.\s*(name|email|profile|id)\b/.test(line),
    severity: 'high',
    message: 'Possible null/undefined dereference',
    suggestion: 'Guard the value before property access or use optional chaining.',
  },
  {
    rule: 'sql_concat',
    test: (_file, line) =>
      /(SELECT|INSERT|UPDATE|DELETE).*\+|query\s*\+\s*|`SELECT\s+.+\${/.test(line),
    severity: 'critical',
    message: 'SQL string concatenation can enable injection',
    suggestion: 'Use parameterized queries instead of concatenating user input.',
  },
  {
    rule: 'leaked_secret',
    test: (_file, line) =>
      /sk-live-|sk-test-|api[_-]?key\s*=\s*['"][^'"]+['"]|password\s*=\s*['"][^'"]+['"]|SECRET\s*=\s*['"]/.test(
        line
      ),
    severity: 'critical',
    message: 'Hard-coded secret or credential in source',
    suggestion: 'Move secrets to environment variables and rotate the leaked value.',
  },
  {
    rule: 'off_by_one',
    test: (_file, line) => /<=\s*\w+\.length/.test(line),
    severity: 'high',
    message: 'Loop bound uses <= length (off-by-one)',
    suggestion: 'Iterate with i < array.length to stay in bounds.',
  },
  {
    rule: 'unused_await',
    test: (_file, line) => /^\s*await\s+\w+/.test(line) && !/=\s*await/.test(line),
    severity: 'high',
    message: 'Awaited result is unused (floating await)',
    suggestion: 'Assign the awaited value or handle the result/error explicitly.',
  },
  {
    rule: 'xss',
    test: (_file, line) => /innerHTML|dangerouslySetInnerHTML|document\.write/.test(line),
    severity: 'critical',
    message: 'Unsanitized HTML assignment can enable XSS',
    suggestion: 'Use textContent or a sanitizer; never assign raw user input to HTML.',
  },
  {
    rule: 'path_traversal',
    test: (_file, line) =>
      /path\.join\([^)]*(req\.(query|params|body)|userPath|filename)/.test(line),
    severity: 'critical',
    message: 'User-controlled path joined without sanitization',
    suggestion: 'Resolve the path and reject any result that escapes the allowed root.',
  },
  {
    rule: 'unsafe_eval',
    test: (_file, line) => /\beval\s*\(|new\s+Function\s*\(/.test(line),
    severity: 'critical',
    message: 'Dynamic eval/Function execution',
    suggestion: 'Remove eval; parse data with JSON.parse or an allow-listed interpreter.',
  },
  {
    rule: 'weak_jwt',
    test: (_file, line) =>
      /jwt\.sign/.test(line) && /['"]secret['"]|['"]jwt-secret['"]|expiresIn/.test(line)
        ? /jwt\.sign/.test(line) && /['"]secret['"]|['"]jwt-secret['"]/.test(line)
        : /jwt\.sign\([^)]*(['"]secret['"]|['"]jwt-secret['"])/.test(line),
    severity: 'critical',
    message: 'Weak or hard-coded JWT secret',
    suggestion: 'Use a strong secret from the environment and set an expiry.',
  },
  {
    rule: 'open_redirect',
    test: (_file, line) =>
      /(redirect|location\.href)\s*\(\s*req\.(query|params|body)/.test(line),
    severity: 'high',
    message: 'Open redirect from user-controlled URL',
    suggestion: 'Allow-list destination paths; never redirect to an arbitrary query value.',
  },
];

const COMBINED_PATTERN =
  'MAYBE_NULL|findUser\\(|SELECT|sk-live-|sk-test-|api[_-]?key\\s*=|password\\s*=\\s*[\'"]|<=\\s*\\w+\\.length|^\\s*await\\s+|innerHTML|eval\\s*\\(|new\\s+Function|jwt\\.sign|redirect\\s*\\(|path\\.join|query\\s*\\+';

async function callTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
  toolCalls: ToolCallRecord[]
): Promise<unknown> {
  if (toolCalls.length >= MAX_TOOL_CALLS) {
    return undefined;
  }
  const started = Date.now();
  const result = await executeTool(name, input, ctx);
  toolCalls.push({
    name,
    input,
    outputPreview: result.ok ? previewOutput(result.data) : result.error || 'error',
    durationMs: Date.now() - started,
    ok: result.ok,
  });
  return result.ok ? result.data : undefined;
}

function scoreFromFindings(findings: Finding[]): number {
  const penalty = findings.reduce((sum, finding) => {
    if (finding.severity === 'critical') return sum + 25;
    if (finding.severity === 'high') return sum + 15;
    if (finding.severity === 'medium') return sum + 6;
    return sum + 2;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export async function deterministicReview(workspaceRoot: string): Promise<{
  findings: Finding[];
  toolCalls: ToolCallRecord[];
  summary: string;
  score: number;
}> {
  const ctx: ToolContext = { workspaceRoot };
  const toolCalls: ToolCallRecord[] = [];
  const findings: Finding[] = [];
  const seen = new Set<string>();

  await callTool('list_files', { path: '.' }, ctx, toolCalls);

  const grepData = (await callTool(
    'grep',
    { pattern: COMBINED_PATTERN, path: '.', maxMatches: 80 },
    ctx,
    toolCalls
  )) as { matches?: Array<{ file: string; line: number; text: string }> } | undefined;

  for (const match of grepData?.matches || []) {
    for (const spec of BUG_RULES) {
      if (!spec.test(match.file, match.text)) continue;
      const key = `${spec.rule}:${match.file}:${match.line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({
        severity: spec.severity,
        file: match.file,
        line: match.line,
        message: spec.message,
        evidence: match.text,
        suggestion: spec.suggestion,
        rule: spec.rule,
      });
    }
  }

  const lintData = (await callTool('run_lint', { path: '.' }, ctx, toolCalls)) as
    | {
        issues?: Array<{
          file: string;
          line: number;
          rule: string;
          severity: 'low' | 'medium';
          message: string;
          evidence: string;
        }>;
      }
    | undefined;

  for (const issue of lintData?.issues || []) {
    const key = `lint:${issue.rule}:${issue.file}:${issue.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({
      severity: issue.severity,
      file: issue.file,
      line: issue.line,
      message: issue.message,
      evidence: issue.evidence,
      suggestion: 'Style-only: keep the change local; not a must-fix defect.',
      rule: issue.rule,
    });
  }

  await callTool('git_diff', {}, ctx, toolCalls);

  const mustFix = findings.filter((f) => f.severity === 'critical' || f.severity === 'high');
  const summary = `Deterministic sandbox review (no billed tokens). ${findings.length} finding(s), ${mustFix.length} must-fix. Tools used: ${
    toolCalls.map((t) => t.name).join(', ') || 'none'
  }.`;

  return {
    findings,
    toolCalls,
    summary,
    score: scoreFromFindings(findings),
  };
}
