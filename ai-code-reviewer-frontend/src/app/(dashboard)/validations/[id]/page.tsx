'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/Loading';
import { FindingsPanel } from '@/components/review/FindingsPanel';
import { useValidationStore } from '@/store/validationStore';
import { formatDateTime, getScoreColor } from '@/lib/utils';

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
        <p className="text-gray-600">Validation not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link href="/validations" className="text-sm text-primary-600 hover:text-primary-700">
            Back to validations
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Review findings</h1>
          <p className="mt-1 text-gray-600">{currentValidation.commitMessage}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <StatusBadge status={currentValidation.status} />
            {currentValidation.overallScore !== undefined && (
              <p className={`text-2xl font-bold ${getScoreColor(currentValidation.overallScore)}`}>
                {currentValidation.overallScore}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {currentValidation.filesAnalyzed || 0} files ·{' '}
              {currentValidation.timestamp ? formatDateTime(currentValidation.timestamp) : ''}
            </p>
          </CardContent>
        </Card>

        {currentValidation.aiSummary && (
          <Card>
            <CardHeader>
              <CardTitle>AI summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {currentValidation.aiSummary}
              </p>
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
