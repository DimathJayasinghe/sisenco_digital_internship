import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-secondary p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Weekly Report Generator</h1>
        <p className="mt-2 text-sm text-text-muted">
          Submit structured weekly reports · Analyze team activity
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Sign in
      </Link>
    </main>
  );
}
