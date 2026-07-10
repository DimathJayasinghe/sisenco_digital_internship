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
      <label
        htmlFor={selectId}
        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={cn(
          'w-full rounded-none border-2 border-zinc-900 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100',
          'focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-500 focus:shadow-brutal-red-sm',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
