'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, Pagination } from '@/components/common/Table';
import { useValidationStore } from '@/store/validationStore';
import { formatDateTime, truncateText } from '@/lib/utils';
import Link from 'next/link';
import { Search, Download, RefreshCw } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-gray-900">Validations</h1>
            <p className="text-gray-600 mt-1">View and manage all code validations</p>
          </div>
          <Button onClick={() => fetchValidations()}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by commit message or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <Button onClick={handleSearch}>
              <Search size={16} className="mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Validations Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableHead>Commit</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : validations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No validations found
                  </TableCell>
                </TableRow>
              ) : (
                validations.map((validation) => (
                  <TableRow
                    key={validation.id}
                    onClick={() => window.location.href = `/validations/${validation.id}`}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {truncateText(validation.commitHash, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truncateText(validation.commitMessage, 40)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {validation.repositoryName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {validation.branchName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={validation.status} />
                    </TableCell>
                    <TableCell>
                      {validation.overallScore !== undefined ? (
                        <span className="font-semibold">{validation.overallScore}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(validation.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/validations/${validation.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && validations.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
