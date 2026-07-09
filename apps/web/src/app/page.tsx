import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Weekly Report Generator</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Submit structured weekly reports · Analyze team activity
        </p>
      </div>
      {/* Not the Button primitive: an <a> must never wrap a <button> (invalid HTML,
          double-interactive for a11y) — style the link directly to match Button's
          primary variant instead. */}
      <Link
        href="/login"
        className="rounded-none border-2 border-zinc-100 bg-violet-600 px-4 py-2 font-medium text-white shadow-brutal-violet transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        Sign in
      </Link>
    </main>
  );
}
