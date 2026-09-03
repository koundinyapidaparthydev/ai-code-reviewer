import { Finding, ToolCallRecord } from '@/types';

const TOOL_LABELS: Record<string, string> = {
  list_files: 'Looked through files',
  grep: 'Searched the code',
  run_lint: 'Ran a lint check',
  git_diff: 'Compared the changes',
  read_file: 'Read a file',
};

export function toolPlainName(name: string): string {
  return TOOL_LABELS[name] || name.replace(/_/g, ' ');
}

export function reviewStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'Still looking';
    case 'completed':
    case 'success':
      return 'Review ready';
    case 'failed':
    case 'error':
      return "Couldn't finish";
    default:
      return status;
  }
}

export function worstSeverity(findings?: Finding[]): Finding['severity'] | null {
  const order: Finding['severity'][] = ['critical', 'high', 'medium', 'low'];
  for (const severity of order) {
    if ((findings || []).some((finding) => finding.severity === severity)) {
      return severity;
    }
  }
  return null;
}

export function severityCounts(findings?: Finding[]) {
  return (findings || []).reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

export function severityChipClass(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-coral-700 text-cream-50';
    case 'high':
      return 'bg-coral-100 text-coral-700';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-ink-100 text-ink-600';
    default:
      return 'bg-ink-100 text-ink-600';
  }
}

export function toolDuration(call: ToolCallRecord): string {
  if (call.durationMs == null) return '';
  return call.durationMs < 1000 ? `${call.durationMs}ms` : `${(call.durationMs / 1000).toFixed(1)}s`;
}
