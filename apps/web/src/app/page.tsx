import { BarChart3, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const FEATURES = [
  {
    icon: FileText,
    title: 'One report, every week',
    body: 'Tasks completed, tasks planned, blockers — the same fixed structure for every member, submitted in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Compliance at a glance',
    body: "See who's submitted, who's late, and who's still pending — a live dashboard, not a spreadsheet someone has to update.",
  },
  {
    icon: Users,
    title: 'Built for two roles',
    body: 'Team members get a focused weekly form. Managers get a dense, filterable view across the whole team.',
  },
];

export default function HomePage(): React.ReactNode {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <header className="border-b-2 border-zinc-900 dark:border-zinc-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Weekly Reports
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Not the Button primitive: an <a> must never wrap a <button> (invalid
                HTML, double-interactive for a11y) — style the link directly to
                match Button's ghost variant instead. */}
            <Link
              href="/login"
              className="rounded-none border-2 border-transparent px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">
            Weekly reports,
            <br />
            without the chasing.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            A fixed-format weekly report for every team member, and a live compliance dashboard for
            managers — no spreadsheets, no reminder DMs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* Not the Button primitive: an <a> must never wrap a <button> (invalid
                HTML, double-interactive for a11y) — style the links directly to
                match Button's primary/secondary variants instead. */}
            <Link
              href="/register"
              className="rounded-none border-2 border-zinc-900 bg-violet-600 px-4 py-2 font-medium text-white shadow-brutal transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:border-zinc-100 dark:shadow-brutal-dark"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-none border-2 border-zinc-900 bg-white px-4 py-2 font-medium text-zinc-900 shadow-brutal transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-brutal-dark"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-5">
                <Icon
                  size={22}
                  strokeWidth={2.25}
                  className="text-violet-600 dark:text-violet-400"
                  aria-hidden
                />
                <p className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-zinc-900 py-6 text-center text-xs text-zinc-600 dark:border-zinc-100 dark:text-zinc-400">
        Weekly Report Generator &amp; Team Dashboard
      </footer>
    </div>
  );
}
