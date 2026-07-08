import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

// useSearchParams (for the post-login ?redirect= target) opts the tree into
// client rendering up to the nearest Suspense boundary — required for
// `next build` to not error on this route.
export default function LoginPage(): React.ReactNode {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
