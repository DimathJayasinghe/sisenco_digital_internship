import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// AGENTS/UI_UX_DESIGN.md §5. Primary/secondary/danger "press" on hover: the
// hard shadow disappears and the element slides into the space it occupied —
// the signature neo-brutalist affordance, and it sidesteps the darken-vs-
// lighten contrast question entirely (§9) since no fill color changes.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'border-2 border-zinc-100 bg-violet-600 text-white shadow-brutal-violet hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
  secondary:
    'border-2 border-zinc-100 bg-zinc-900 text-zinc-100 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
  ghost:
    'border-2 border-transparent text-zinc-400 hover:border-zinc-100 hover:bg-zinc-900 hover:text-zinc-100',
  danger:
    'border-2 border-zinc-100 bg-red-600 text-white shadow-brutal-red hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
};

/**
 * Primary UI button primitive. Spreads native button attributes so it stays
 * maximally reusable (per CODING_STANDARDS §5).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'rounded-none px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
});
