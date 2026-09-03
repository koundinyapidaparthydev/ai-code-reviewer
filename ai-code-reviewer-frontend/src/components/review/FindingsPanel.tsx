import React from 'react';
import { Finding, ToolCallRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { severityChipClass, toolDuration, toolPlainName } from '@/lib/reviewCopy';

function severityVariant(severity: Finding['severity']) {
  if (severity === 'critical' || severity === 'high') return 'error' as const;
  if (severity === 'medium') return 'warning' as const;
  return 'info' as const;
}

export function FindingsPanel({
  findings = [],
  toolCalls = [],
  reviewMode,
}: {
  findings?: Finding[];
  toolCalls?: ToolCallRecord[];
  reviewMode?: string;
}) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-800">
              What Codebird found
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {findings.length === 0
                ? 'Nothing to fix in this pass.'
                : `${findings.length} thing${findings.length === 1 ? '' : 's'} to look at.`}
            </p>
          </div>
          {reviewMode && (
            <p className="text-xs text-ink-400">
              Codebird checked this file
            </p>
          )}
        </div>

        {findings.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-10 text-center text-sm text-ink-400">
              No findings recorded.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {findings.map((finding, index) => (
              <article
                key={`${finding.file}-${finding.line}-${index}`}
                className="stagger-in hover-lift rounded-paper border border-ink-100 bg-cream-50 p-5 shadow-paper"
                style={{ '--i': index } as React.CSSProperties}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${severityChipClass(
                      finding.severity
                    )}`}
                    data-variant={severityVariant(finding.severity)}
                  >
                    {finding.severity}
                  </span>
                  <span className="font-mono text-sm text-ink-600">{finding.file}</span>
                  {finding.line != null && (
                    <span className="text-sm text-ink-400">line {finding.line}</span>
                  )}
                </div>
                <p className="mt-3 text-base font-medium text-ink-800">{finding.message}</p>
                {finding.evidence && (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-ink-800 px-4 py-3 font-mono text-xs leading-relaxed text-cream-100">
                    {finding.evidence}
                  </pre>
                )}
                {finding.suggestion && (
                  <p className="mt-3 text-sm text-ink-500">
                    <span className="font-medium text-ink-700">Try this: </span>
                    {finding.suggestion}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <Card>
        <CardHeader className="border-b-0 pb-0">
          <CardTitle>Tools Codebird used</CardTitle>
          <p className="mt-1 text-sm text-ink-500">
            How the bird walked through this review.
          </p>
        </CardHeader>
        <CardContent>
          {toolCalls.length === 0 ? (
            <p className="text-sm text-ink-400">No tool calls recorded.</p>
          ) : (
            <ol className="relative ml-2 space-y-0">
              <span
                className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-ink-100"
                style={{ animation: 'timeline-grow 0.7s ease both' }}
                aria-hidden
              />
              {toolCalls.map((call, index) => (
                <li
                  key={`${call.name}-${index}`}
                  className="stagger-in relative flex gap-4 py-3 pl-1"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <span
                    className={`relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                      call.ok
                        ? 'border-coral-500 bg-cream-50'
                        : 'border-coral-700 bg-coral-100'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-800">
                        {toolPlainName(call.name)}
                      </p>
                      <span className="text-xs text-ink-400">
                        {toolDuration(call)}
                        {call.ok ? '' : ' · failed'}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-ink-400">{call.name}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
