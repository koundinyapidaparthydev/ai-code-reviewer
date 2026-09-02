import { Finding, ToolCallRecord, Validation, ValidationDetail } from '@/types';

function asFindings(value: unknown): Finding[] {
  return Array.isArray(value) ? (value as Finding[]) : [];
}

function asToolCalls(value: unknown): ToolCallRecord[] {
  return Array.isArray(value) ? (value as ToolCallRecord[]) : [];
}

export function normalizeValidation(raw: Record<string, unknown>): Validation {
  const repository = raw.repository as { name?: string; fullName?: string } | undefined;
  return {
    id: String(raw.id || ''),
    commitHash: String(raw.commitHash || ''),
    commitMessage: String(raw.commitMessage || raw.aiSummary || 'Manual review'),
    repositoryName: String(repository?.name || raw.repositoryName || 'manual'),
    branchName: String(raw.branch || raw.branchName || '-'),
    status: (raw.status as Validation['status']) || 'pending',
    timestamp: String(raw.createdAt || raw.timestamp || ''),
    overallScore:
      raw.overallScore == null ? undefined : Number(raw.overallScore),
    filesAnalyzed: Number(raw.filesProcessed || raw.totalFiles || 0),
    findings: asFindings(raw.findings),
    toolCalls: asToolCalls(raw.toolCalls),
    reviewMode: raw.reviewMode ? String(raw.reviewMode) : undefined,
    aiSummary: raw.aiSummary ? String(raw.aiSummary) : undefined,
  };
}

export function normalizeValidationDetail(raw: Record<string, unknown>): ValidationDetail {
  const base = normalizeValidation(raw);
  const fileResults = Array.isArray(raw.fileResults) ? raw.fileResults : [];
  return {
    ...base,
    author: String(raw.commitAuthor || 'demo'),
    files: fileResults.map((file: Record<string, unknown>) => ({
      fileName: String(file.fileName || ''),
      linesChanged: Number(file.linesChanged || 0),
      status: (file.status as 'success' | 'warning' | 'error') || 'success',
      issues: asFindings(file.issues).map((issue) => ({
        line: issue.line || 0,
        severity:
          issue.severity === 'critical' || issue.severity === 'high'
            ? 'error'
            : issue.severity === 'medium'
            ? 'warning'
            : 'info',
        message: issue.message,
        category: 'best-practice' as const,
      })),
      qualityScore: Number(file.score || 0),
    })),
    aiFeedback: {
      generalComments: base.aiSummary ? [base.aiSummary] : [],
      bestPractices: [],
      securityConcerns: [],
      performanceRecommendations: [],
    },
  };
}
