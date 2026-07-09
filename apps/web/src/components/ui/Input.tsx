import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /**
   * Optional leading icon (e.g. a search glyph). Rendered inside a wrapper
   * scoped to just the `<input>` box — centering it against the outer div
   * (which also contains the label) would put it too high, since `top-1/2`
   * would center against label+input combined, not the input alone.
   */
  icon?: ReactNode;
}

/**
 * Labeled text input primitive. AGENTS/UI_UX_DESIGN.md §5 — every input
 * carries a visible label and, when invalid, a red border plus helper text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, icon, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400"
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full rounded-none border-2 border-zinc-900 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
            'focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-40',
            icon && 'pl-9',
            error && 'border-red-500 focus:shadow-brutal-red-sm',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
