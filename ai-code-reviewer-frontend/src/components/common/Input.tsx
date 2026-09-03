import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-ink-600">
            {label}
            {props.required && <span className="ml-1 text-coral-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-cream-50 px-3.5 py-2.5 text-ink-800 shadow-sm placeholder:text-ink-400',
            'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-coral-400',
            'disabled:cursor-not-allowed disabled:bg-cream-100',
            error ? 'border-coral-500' : 'border-ink-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-coral-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-ink-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
