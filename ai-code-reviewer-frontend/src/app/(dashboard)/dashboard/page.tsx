'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/Loading';
import { useValidationStore } from '@/store/validationStore';
import { formatRelativeTime, getScoreColor } from '@/lib/utils';
import { severityChipClass, worstSeverity } from '@/lib/reviewCopy';
import { CountUp } from '@/components/ui/CountUp';
import Link from 'next/link';
import { FileCheck, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { FindingsPanel } from '@/components/review/FindingsPanel';

export default function DashboardPage() {
  const {
    statistics,
    validations,
    currentValidation,
    loading,
    fetchStatistics,
    fetchValidations,
    fetchValidation,
  } = useValidationStore();

  useEffect(() => {
    fetchStatistics();
    fetchValidations({ limit: 10 });
  }, [fetchStatistics, fetchValidations]);

  useEffect(() => {
    if (validations[0]?.id) {
      fetchValidation(validations[0].id);
    }
  }, [validations, fetchValidation]);

  if (loading && !statistics) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: 'Reviews so far',
      value: statistics?.totalValidations || 0,
      suffix: '',
      icon: FileCheck,
      tone: 'text-coral-600 bg-coral-50',
    },
    {
      label: 'Ready rate',
      value: statistics?.successRate || 0,
      suffix: '%',
      icon: TrendingUp,
      tone: 'text-sage-600 bg-sage-50',
    },
    {
      label: 'Couldn’t finish',
      value: statistics?.failedValidations || 0,
      suffix: '',
      icon: AlertCircle,
      tone: 'text-coral-700 bg-coral-50',
    },
    {
      label: 'Still looking',
      value: statistics?.pendingReviews || 0,
      suffix: '',
      icon: Clock,
      tone: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-coral-100 bg-coral-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-700">
            <span className="live-dot h-2 w-2 rounded-full bg-coral-500" />
            Live nest
          </div>
          <h1 className="font-display text-4xl font-semibold text-ink-800">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-500">
            Codebird reads your files, then tells you what to fix.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="stagger-in"
                style={{ '--i': index } as React.CSSProperties}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-500">{stat.label}</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-ink-800">
                        <CountUp value={stat.value} suffix={stat.suffix} />
                      </p>
                    </div>
                    <div className={`rounded-2xl p-3 ${stat.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent reviews</CardTitle>
              <Link
                href="/validations"
                className="text-sm font-medium text-coral-600 hover:text-coral-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {validations.length === 0 ? (
              <div className="px-6 py-12 text-center text-ink-400">
                No reviews yet. Upload a file and Codebird will take a look.
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {validations.map((validation) => {
                  const worst = worstSeverity(validation.findings);
                  return (
                    <Link
                      key={validation.id}
                      href={`/validations/${validation.id}`}
                      className="block px-6 py-4 transition-colors hover:bg-cream-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={validation.status} />
                            {worst && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${severityChipClass(
                                  worst
                                )}`}
                              >
                                {worst}
                              </span>
                            )}
                            <p className="truncate text-sm font-medium text-ink-800">
                              {validation.commitMessage}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center gap-4">
                            <p className="text-xs text-ink-500">
                              {validation.repositoryName} · {validation.branchName}
                            </p>
                            <p className="text-xs text-ink-400">
                              {formatRelativeTime(validation.timestamp)}
                            </p>
                          </div>
                        </div>
                        {validation.overallScore !== undefined && (
                          <div className="ml-4">
                            <p
                              className={`font-display text-2xl font-semibold ${getScoreColor(
                                validation.overallScore
                              )}`}
                            >
                              {validation.overallScore}
                            </p>
                            <p className="text-center text-xs text-ink-400">score</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <FindingsPanel
            findings={currentValidation?.findings}
            toolCalls={currentValidation?.toolCalls}
            reviewMode={currentValidation?.reviewMode}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
