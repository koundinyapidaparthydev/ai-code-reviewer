import { z } from 'zod';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export const findingSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  file: z.string().min(1),
  line: z.number().int().nullable(),
  message: z.string().min(1),
  evidence: z.string(),
  suggestion: z.string(),
  rule: z.string().min(1).optional(),
});

export type Finding = z.infer<typeof findingSchema>;

export function validateFinding(raw: unknown): { ok: true; data: Finding } | { ok: false; error: string } {
  const parsed = findingSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  return { ok: false, error: parsed.error.issues.map((issue) => issue.message).join('; ') };
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
