'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/Loading';
import { useValidationStore } from '@/store/validationStore';
import { formatRelativeTime, getScoreColor } from '@/lib/utils';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your code validation activity
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Validations
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics?.totalValidations || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {statistics?.successRate || 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Failed Validations
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {statistics?.failedValidations || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {statistics?.pendingReviews || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Validations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Validations</CardTitle>
              <Link
                href="/validations"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {validations.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No validations yet. Start by connecting a repository or uploading
                code manually.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {validations.map((validation) => (
                  <Link
                    key={validation.id}
                    href={`/validations/${validation.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={validation.status} />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {validation.commitMessage}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-gray-600">
                            {validation.repositoryName} •{' '}
                            {validation.branchName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(validation.timestamp)}
                          </p>
                        </div>
                      </div>
                      {validation.overallScore !== undefined && (
                        <div className="ml-4">
                          <p
                            className={`text-2xl font-bold ${getScoreColor(
                              validation.overallScore
                            )}`}
                          >
                            {validation.overallScore}
                          </p>
                          <p className="text-xs text-gray-500 text-center">
                            score
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            Latest review findings
          </h2>
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
