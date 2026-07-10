import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

// useSearchParams (for the post-login ?redirect= target) opts the tree into
// client rendering up to the nearest Suspense boundary — required for
// `next build` to not error on this route. Page chrome (brand panel, Back
// link) lives in the shared (auth)/layout.tsx.
export default function LoginPage(): React.ReactNode {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
