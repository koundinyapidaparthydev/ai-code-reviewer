import path from 'path';
import { Finding } from '../types/finding';
import { FixtureScore, LoadedFixture, MustFixLabel } from './types';

const RULE_KEYWORDS: Record<string, string[]> = {
  null_deref: ['null', 'undefined', 'deref', 'optional chaining'],
  sql_concat: ['sql', 'concat', 'injection'],
  leaked_secret: ['secret', 'credential', 'api key', 'password', 'sk-'],
  off_by_one: ['off-by-one', 'off by one', 'bounds', 'length'],
  unused_await: ['unused await', 'floating await', 'awaited result'],
  xss: ['xss', 'innerhtml', 'sanitiz'],
  path_traversal: ['path traversal', 'directory traversal', 'sanitiz'],
  unsafe_eval: ['eval', 'function constructor', 'dynamic'],
  weak_jwt: ['jwt', 'secret', 'hard-coded', 'hardcoded'],
  open_redirect: ['redirect', 'open redirect'],
};

export function isMustFixFinding(finding: Finding): boolean {
  return finding.severity === 'critical' || finding.severity === 'high';
}

function fileMatches(found: string, labeled: string): boolean {
  const a = found.split(path.sep).join('/');
  const b = labeled.split(path.sep).join('/');
  return a === b || a.endsWith(b) || b.endsWith(a) || path.basename(a) === path.basename(b);
}

export function findingMatchesLabel(finding: Finding, label: MustFixLabel): boolean {
  if (!fileMatches(finding.file, label.file)) return false;
  if (finding.rule && finding.rule === label.rule) return true;

  const text = `${finding.message} ${finding.evidence} ${finding.suggestion} ${finding.rule || ''}`.toLowerCase();
  const keywords = RULE_KEYWORDS[label.rule] || [label.rule.replace(/_/g, ' ')];
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function scoreFixture(fixture: LoadedFixture, findings: Finding[]): FixtureScore {
  const predicted = findings.filter(isMustFixFinding);
  const labels = fixture.labels.must_fix || [];
  const usedPred = new Set<number>();
  let truePositives = 0;

  for (const label of labels) {
    const idx = predicted.findIndex(
      (finding, i) => !usedPred.has(i) && findingMatchesLabel(finding, label)
    );
    if (idx >= 0) {
      usedPred.add(idx);
      truePositives += 1;
    }
  }

  const falsePositives = predicted.length - truePositives;
  const falseNegatives = labels.length - truePositives;
  const precision = predicted.length === 0 ? (labels.length === 0 ? 1 : 0) : truePositives / predicted.length;
  const recall = labels.length === 0 ? 1 : truePositives / labels.length;

  return {
    id: fixture.id,
    category: fixture.labels.category,
    predictedMustFix: predicted.length,
    labeledMustFix: labels.length,
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
  };
}

export function aggregateScores(fixtures: FixtureScore[]): {
  precision: number;
  recall: number;
  f1: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
} {
  const truePositives = fixtures.reduce((sum, item) => sum + item.truePositives, 0);
  const falsePositives = fixtures.reduce((sum, item) => sum + item.falsePositives, 0);
  const falseNegatives = fixtures.reduce((sum, item) => sum + item.falseNegatives, 0);
  const precision =
    truePositives + falsePositives === 0 ? 1 : truePositives / (truePositives + falsePositives);
  const recall =
    truePositives + falseNegatives === 0 ? 1 : truePositives / (truePositives + falseNegatives);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1, truePositives, falsePositives, falseNegatives };
}
