'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { Github } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome to Codebird');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Codebird could not sign you in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="paper-card px-8 py-8">
        <div className="mb-7 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-800">
            Sign in to Codebird
          </h1>
          <p className="mt-2 text-sm text-ink-500">A bird reviews your code.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+(\.[A-Z]{2,})?$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            {...register('password', {
              required: 'Password is required',
            })}
            error={errors.password?.message}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-coral-600 hover:text-coral-700"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => toast('GitHub sign-in is coming to Codebird')}
            >
              <Github className="mr-2" size={20} />
              Sign in with GitHub
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-ink-700">
          <p className="font-semibold text-amber-800">This is a sandbox</p>
          <p className="mt-1 text-ink-600">
            Try <span className="font-mono text-ink-800">demo@local</span> /{' '}
            <span className="font-mono text-ink-800">demo-password</span>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-coral-600 hover:text-coral-700">
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
