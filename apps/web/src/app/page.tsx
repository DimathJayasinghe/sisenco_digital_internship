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
      <Link
        href="/login"
        className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-700"
      >
        Sign in
      </Link>
    </main>
  );
}
