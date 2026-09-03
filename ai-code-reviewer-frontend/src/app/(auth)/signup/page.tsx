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
import { getPasswordStrength } from '@/lib/utils';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();

  const password = watch('password');

  React.useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success('Welcome to Codebird');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Codebird could not create your account');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-coral-500';
      case 'medium':
        return 'bg-amber-500';
      case 'strong':
        return 'bg-sage-600';
    }
  };

  return (
    <AuthShell>
      <div className="paper-card px-8 py-8">
        <div className="mb-7 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-800">
            Join Codebird
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Let a bird review your code.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            error={errors.name?.message}
            placeholder="Jane Doe"
          />

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

          <div>
            <Input
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={errors.password?.message}
              placeholder="••••••••"
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i < passwordStrength.score ? getStrengthColor() : 'bg-ink-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs capitalize text-ink-500">
                  Password strength: {passwordStrength.strength}
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
            })}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
          />

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              {...register('terms', {
                required: 'You must accept the terms and conditions',
              })}
              className="mt-1 h-4 w-4 rounded border-ink-200 text-coral-500 focus:ring-coral-400"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-ink-700">
              I agree to the{' '}
              <Link href="/terms" className="text-coral-600 hover:text-coral-500">
                Terms and Conditions
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-coral-600">{errors.terms.message}</p>}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create account
          </Button>

          <p className="text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-coral-600 hover:text-coral-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
