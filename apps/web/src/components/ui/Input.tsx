import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Labeled text input primitive. AGENTS/UI_UX_DESIGN.md §5 — every input
 * carries a visible label and, when invalid, a red border plus helper text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'w-full rounded-none border-2 border-zinc-100 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500',
          'focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-500 focus:shadow-brutal-red-sm',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
