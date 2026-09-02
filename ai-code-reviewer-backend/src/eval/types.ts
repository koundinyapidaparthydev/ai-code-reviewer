import { Finding, ToolCallRecord } from '../types/finding';

export interface MustFixLabel {
  file: string;
  rule: string;
  severity?: string;
  line?: number;
}

export interface FixtureLabels {
  id: string;
  category: 'bug' | 'style' | 'mixed' | 'security';
  must_fix: MustFixLabel[];
}

export interface LoadedFixture {
  id: string;
  dir: string;
  inputDir: string;
  labels: FixtureLabels;
}

export interface FixtureScore {
  id: string;
  category: FixtureLabels['category'];
  predictedMustFix: number;
  labeledMustFix: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
}

export interface EvalReport {
  generatedAt: string;
  reviewMode: string;
  usedOpenAI: boolean;
  fixtureCount: number;
  precision: number;
  recall: number;
  f1: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  fixtures: FixtureScore[];
  notes: string;
}

export interface ReviewSnapshot {
  findings: Finding[];
  toolCalls: ToolCallRecord[];
}
