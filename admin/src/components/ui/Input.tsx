import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-aura-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-aura-400 pointer-events-none">{icon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl bg-espresso-900/80 border border-aura-800/80 text-aura-50 placeholder:text-aura-500/60 px-3.5 py-2.5 text-sm focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20 transition-all",
              icon && "pl-10",
              error && "border-red-500/70 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-aura-400/80">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
