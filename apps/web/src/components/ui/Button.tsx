import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// AGENTS/UI_UX_DESIGN.md §5. Primary darkens on hover (violet-600 -> 700),
// never lightens — see §9 for why (violet-500 fails AA contrast for white text).
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
  secondary: 'border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10',
  ghost: 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
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
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
});
