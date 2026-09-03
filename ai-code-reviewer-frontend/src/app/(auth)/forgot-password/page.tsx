'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { CheckCircle } from 'lucide-react';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await apiClient.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Codebird sent reset instructions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Codebird could not send that email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthShell>
        <div className="paper-card px-8 py-10 text-center">
          <CheckCircle className="mx-auto h-14 w-14 text-sage-600" />
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink-800">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Codebird sent password reset instructions to your inbox.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button variant="primary">Back to Codebird</Button>
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="paper-card px-8 py-8">
        <div className="mb-7 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-800">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Enter your email and Codebird will send reset instructions.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
            placeholder="you@example.com"
          />

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send reset instructions
            </Button>

            <Link href="/login" className="block text-center">
              <Button type="button" variant="ghost" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
