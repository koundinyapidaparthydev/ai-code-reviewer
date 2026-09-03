'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRepositoryStore } from '@/store/repositoryStore';
import { Github } from 'lucide-react';

interface ConnectRepoForm {
  repositoryUrl: string;
  branch: string;
  autoValidateOnPush: boolean;
  validateOnPullRequest: boolean;
}

export default function ConnectRepositoryPage() {
  const router = useRouter();
  const { connectRepository, loading } = useRepositoryStore();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectRepoForm>({
    defaultValues: {
      branch: 'main',
      autoValidateOnPush: true,
      validateOnPullRequest: true,
    },
  });

  const onSubmit = async (data: ConnectRepoForm) => {
    try {
      await connectRepository(data);
      toast.success('Repository connected successfully!');
      router.push('/repositories');
    } catch (error) {
      toast.error('Failed to connect repository');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink-800">
            Connect a nest
          </h1>
          <p className="text-gray-600 mt-1">
            Connect GitHub so Codebird can review new work automatically
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Repository Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast('GitHub OAuth coming soon')}
                >
                  <Github className="mr-2" size={20} />
                  Authorize with GitHub
                </Button>
                <p className="mt-2 text-xs text-center text-gray-500">
                  Or enter repository URL manually
                </p>
              </div>

              <Input
                label="Repository URL"
                type="text"
                {...register('repositoryUrl', {
                  required: 'Repository URL is required',
                  pattern: {
                    value: /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/,
                    message: 'Invalid GitHub repository URL',
                  },
                })}
                error={errors.repositoryUrl?.message}
                placeholder="https://github.com/username/repository"
                helperText="Example: https://github.com/username/my-project"
              />

              <Input
                label="Default Branch"
                type="text"
                {...register('branch', {
                  required: 'Branch is required',
                })}
                error={errors.branch?.message}
                placeholder="main"
              />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Webhook Configuration
                </h3>

                <div className="flex items-start gap-3">
                  <input
                    id="autoValidateOnPush"
                    type="checkbox"
                    {...register('autoValidateOnPush')}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoValidateOnPush" className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Auto-validate on push
                    </p>
                    <p className="text-xs text-gray-500">
                      Automatically validate code when commits are pushed
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="validateOnPullRequest"
                    type="checkbox"
                    {...register('validateOnPullRequest')}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="validateOnPullRequest" className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Validate on pull request
                    </p>
                    <p className="text-xs text-gray-500">
                      Run validation when pull requests are created or updated
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  Connect Repository
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
