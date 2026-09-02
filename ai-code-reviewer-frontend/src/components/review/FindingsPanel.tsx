import React from 'react';
import { Finding, ToolCallRecord } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Findings</CardTitle>
            {reviewMode && (
              <span className="text-xs text-gray-500">mode: {reviewMode}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {findings.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">No findings recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Line
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {findings.map((finding, index) => (
                    <tr key={`${finding.file}-${finding.line}-${index}`}>
                      <td className="px-4 py-3">
                        <Badge variant={severityVariant(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{finding.file}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {finding.line ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <p>{finding.message}</p>
                        {finding.evidence && (
                          <p className="mt-1 font-mono text-xs text-gray-500">
                            {finding.evidence}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tools the agent called</CardTitle>
        </CardHeader>
        <CardContent>
          {toolCalls.length === 0 ? (
            <p className="text-sm text-gray-500">No tool calls recorded.</p>
          ) : (
            <ol className="space-y-3">
              {toolCalls.map((call, index) => (
                <li key={`${call.name}-${index}`} className="rounded-md border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {call.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {call.durationMs}ms {call.ok ? '' : '(failed)'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {JSON.stringify(call.input)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
