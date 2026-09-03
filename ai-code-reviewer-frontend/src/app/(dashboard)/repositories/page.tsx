'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useRepositoryStore } from '@/store/repositoryStore';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { GitBranch, Plus, Settings, Activity } from 'lucide-react';

export default function RepositoriesPage() {
  const { repositories, loading, fetchRepositories } = useRepositoryStore();

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold text-ink-800">Repositories</h1>
            <p className="mt-1 text-ink-500">
              Places Codebird can perch and review
            </p>
          </div>
          <Link href="/repositories/connect">
            <Button>
              <Plus size={16} className="mr-2" />
              Connect Repository
            </Button>
          </Link>
        </div>

        {loading && repositories.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600" />
          </div>
        ) : repositories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No repositories connected
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Connect a repository so Codebird can review new work automatically
              </p>
              <Link href="/repositories/connect" className="mt-6 inline-block">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Connect Repository
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <Card key={repo.id} hover>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-gray-400" />
                      <CardTitle className="text-base">{repo.name}</CardTitle>
                    </div>
                    <StatusBadge
                      status={repo.isConnected ? 'active' : 'inactive'}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Owner</p>
                      <p className="text-sm font-medium text-gray-900">
                        {repo.owner}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Branch</p>
                      <p className="text-sm font-medium text-gray-900">
                        {repo.branch}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Validation</p>
                      <p className="text-sm text-gray-700">
                        {repo.lastValidation
                          ? formatRelativeTime(repo.lastValidation)
                          : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Total Validations</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {repo.totalValidations}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={repo.webhookStatus} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {}}
                      >
                        <Settings size={14} className="mr-1" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Activity size={14} className="mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
