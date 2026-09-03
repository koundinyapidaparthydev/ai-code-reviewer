'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Pagination } from '@/components/common/Table';
import { useValidationStore } from '@/store/validationStore';
import { formatRelativeTime, getScoreColor } from '@/lib/utils';
import { severityChipClass, severityCounts, worstSeverity } from '@/lib/reviewCopy';
import Link from 'next/link';
import { Search, RefreshCw } from 'lucide-react';

export default function ValidationsPage() {
  const { validations, loading, pagination, fetchValidations, setPage, setFilters } =
    useValidationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchValidations();
  }, [fetchValidations]);

  const handleSearch = () => {
    setFilters({ search: searchTerm, status: statusFilter as any });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-ink-800">Reviews</h1>
            <p className="mt-1 text-ink-500">Every time Codebird checked a file.</p>
          </div>
          <Button onClick={() => fetchValidations()}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search by message or hash…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-ink-200 bg-cream-50 px-4 py-2.5 text-ink-700 focus:outline-none focus:ring-2 focus:ring-coral-400"
            >
              <option value="">All reviews</option>
              <option value="pending">Still looking</option>
              <option value="completed">Review ready</option>
              <option value="failed">Couldn&apos;t finish</option>
            </select>
            <Button onClick={handleSearch}>
              <Search size={16} className="mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cream-200 border-t-coral-500" />
          </div>
        ) : validations.length === 0 ? (
          <Card>
            <p className="px-6 py-16 text-center text-ink-400">
              No reviews yet. Upload a file and Codebird will take a look.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {validations.map((validation, index) => {
              const worst = worstSeverity(validation.findings);
              const counts = severityCounts(validation.findings);
              const chips = (['critical', 'high', 'medium', 'low'] as const).filter(
                (key) => counts[key] > 0
              );

              return (
                <Link
                  key={validation.id}
                  href={`/validations/${validation.id}`}
                  className="stagger-in hover-lift block rounded-paper border border-ink-100 bg-cream-50 p-5 shadow-paper"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={validation.status} />
                        {chips.map((severity) => (
                          <span
                            key={severity}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${severityChipClass(
                              severity
                            )}`}
                          >
                            {counts[severity]} {severity}
                          </span>
                        ))}
                        {!worst && validation.status !== 'pending' && (
                          <span className="text-xs text-ink-400">No issues flagged</span>
                        )}
                      </div>
                      <h2 className="mt-3 font-display text-xl font-semibold text-ink-800">
                        {validation.commitMessage}
                      </h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {validation.repositoryName} · {validation.branchName}
                        {validation.filesAnalyzed
                          ? ` · ${validation.filesAnalyzed} file${
                              validation.filesAnalyzed === 1 ? '' : 's'
                            }`
                          : ''}
                      </p>
                      <p className="mt-2 text-xs text-ink-400">
                        {validation.timestamp ? formatRelativeTime(validation.timestamp) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {validation.overallScore !== undefined ? (
                        <>
                          <p
                            className={`font-display text-3xl font-semibold ${getScoreColor(
                              validation.overallScore
                            )}`}
                          >
                            {validation.overallScore}
                          </p>
                          <p className="text-xs text-ink-400">score</p>
                        </>
                      ) : (
                        <p className="text-sm text-ink-400">In flight</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && validations.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
