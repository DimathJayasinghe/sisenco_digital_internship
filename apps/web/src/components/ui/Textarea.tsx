import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * Labeled textarea primitive. `min-h-32` per AGENTS/UI_UX_DESIGN.md §6 — the
 * member report's text fields (tasks, blockers) need room to write in.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={textareaId}
        className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={cn(
          'min-h-32 w-full rounded-none border-2 border-zinc-900 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500',
          'focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-500 focus:shadow-brutal-red-sm',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});
