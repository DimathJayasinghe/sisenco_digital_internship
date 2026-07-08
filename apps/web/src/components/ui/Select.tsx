import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

/** Labeled select primitive — same label/error convention as Input/Textarea. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...props },
  ref,
): ReactNode {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={cn(
          'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100',
          'focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
