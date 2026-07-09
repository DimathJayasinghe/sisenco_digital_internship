import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

// useSearchParams (for the post-login ?redirect= target) opts the tree into
// client rendering up to the nearest Suspense boundary — required for
// `next build` to not error on this route.
export default function LoginPage(): React.ReactNode {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-100 p-8 dark:bg-zinc-900">
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
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
