import Link from 'next/link';

/** Landed on by TEAM_MEMBER users redirected out of /(manager)/* — SECURITY_GUIDELINES.md §2. */
export default function UnauthorizedPage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100 p-8 text-center dark:bg-zinc-900">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Access denied
      </h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        You don&apos;t have permission to view this page. Manager-only areas are restricted to
        managers.
      </p>
      {/* Not the Button primitive: an <a> must never wrap a <button> (invalid HTML,
          double-interactive for a11y) — style the link directly to match Button's
          secondary variant instead. */}
      <Link
        href="/reports"
        className="rounded-none border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-brutal transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-brutal-dark"
      >
        Back to my reports
      </Link>
    </main>
  );
}
