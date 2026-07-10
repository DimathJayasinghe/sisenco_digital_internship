import { ArrowLeft, BarChart3, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const HIGHLIGHTS = [
  { icon: FileText, text: 'One fixed-format report, every week' },
  { icon: BarChart3, text: 'Compliance at a glance for managers' },
  { icon: Users, text: 'A focused view for each role' },
];

/**
 * Shared shell for /login and /register: a brand panel (wordmark, tagline,
 * feature highlights — reusing the landing page's copy/icons) on the left,
 * hidden below `lg` where there isn't room for it alongside a full-height
 * form. Violet is used only on the highlight icons, not as a panel fill —
 * a full-color block would violate §1's "no color-blocking" rule.
 */
export default function AuthLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <aside className="relative hidden w-[38%] max-w-md flex-col border-r-2 border-zinc-900 dark:border-zinc-300 lg:flex">
        {/* Decorative dot-grid texture — fills the panel's empty margins with
            visible structure instead of dead space, in keeping with §1's
            brutalist-in-its-bones philosophy. Non-text/decorative, so it's
            exempt from a contrast requirement; kept low-opacity so it reads
            as texture, not a competing pattern. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:22px_22px] dark:bg-[radial-gradient(circle,rgba(212,212,216,0.08)_1px,transparent_1px)]"
        />
        <Link
          href="/"
          className="relative mt-12 px-12 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Weekly Reports
        </Link>
        <div className="relative flex flex-1 flex-col justify-center px-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Weekly reports, without the chasing.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            A fixed-format weekly report for every team member, and a live compliance dashboard for
            managers.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon
                  size={18}
                  strokeWidth={2.25}
                  className="shrink-0 text-violet-600 dark:text-violet-400"
                  aria-hidden
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mb-10 px-12 text-xs text-zinc-600 dark:text-zinc-400">
          Weekly Report Generator &amp; Team Dashboard
        </p>
      </aside>

      <main className="relative flex flex-1 items-center justify-center p-8">
        {/* Not the Button primitive: an <a> must never wrap a <button> (invalid
            HTML, double-interactive for a11y) — style the link directly to
            match Button's ghost variant instead. */}
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-none border-2 border-transparent px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:left-6 sm:top-6"
        >
          <ArrowLeft size={16} aria-hidden />
          Back
        </Link>
        {children}
      </main>
    </div>
  );
}
