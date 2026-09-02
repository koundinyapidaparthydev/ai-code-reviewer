export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Finding {
  severity: FindingSeverity;
  file: string;
  line: number | null;
  message: string;
  evidence: string;
  suggestion: string;
  rule?: string;
}

export interface ToolCallRecord {
  name: string;
  input: Record<string, unknown>;
  outputPreview: string;
  durationMs: number;
  ok: boolean;
}

export interface AgentReviewResult {
  findings: Finding[];
  toolCalls: ToolCallRecord[];
  summary: string;
  score: number;
  reviewMode: 'tools' | 'legacy' | 'deterministic';
}
