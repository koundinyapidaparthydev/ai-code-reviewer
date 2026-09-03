'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/Loading';
import { FindingsPanel } from '@/components/review/FindingsPanel';
import { useValidationStore } from '@/store/validationStore';
import { formatDateTime, getScoreColor } from '@/lib/utils';
import { BirdMark } from '@/components/brand/BirdMark';

export default function ValidationDetailPage() {
  const params = useParams<{ id: string }>();
  const { currentValidation, loading, fetchValidation } = useValidationStore();

  useEffect(() => {
    if (params.id) {
      fetchValidation(params.id);
    }
  }, [params.id, fetchValidation]);

  if (loading && !currentValidation) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (!currentValidation) {
    return (
      <DashboardLayout>
        <p className="text-ink-500">Codebird could not find this review.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <Link
            href="/validations"
            className="text-sm font-medium text-coral-600 hover:text-coral-700"
          >
            Back to reviews
          </Link>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <BirdMark size={52} animate />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-600">
                Codebird checked this file
              </p>
              <h1 className="mt-1 font-display text-4xl font-semibold text-ink-800">
                What Codebird found
              </h1>
              <p className="mt-2 text-lg text-ink-500">{currentValidation.commitMessage}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 py-5">
            <StatusBadge status={currentValidation.status} />
            {currentValidation.overallScore !== undefined && (
              <p
                className={`font-display text-3xl font-semibold ${getScoreColor(
                  currentValidation.overallScore
                )}`}
              >
                {currentValidation.overallScore}
                <span className="ml-1 text-sm font-sans font-medium text-ink-400">score</span>
              </p>
            )}
            <p className="text-sm text-ink-500">
              {currentValidation.filesAnalyzed || 0} file
              {(currentValidation.filesAnalyzed || 0) === 1 ? '' : 's'} ·{' '}
              {currentValidation.timestamp ? formatDateTime(currentValidation.timestamp) : ''}
            </p>
          </CardContent>
        </Card>

        {currentValidation.aiSummary && (
          <Card>
            <CardContent className="py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                In plain English
              </p>
              <p className="mt-2 whitespace-pre-wrap text-ink-700">{currentValidation.aiSummary}</p>
            </CardContent>
          </Card>
        )}

        <FindingsPanel
          findings={currentValidation.findings}
          toolCalls={currentValidation.toolCalls}
          reviewMode={currentValidation.reviewMode}
        />
      </div>
    </DashboardLayout>
  );
}
