'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Role } from '@sisenco/shared-types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/api/error';

export function LoginForm(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setFormError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          const redirect = searchParams.get('redirect');
          const fallback = user.role === Role.MANAGER ? '/dashboard' : '/reports';
          router.replace(redirect ?? fallback);
        },
        onError: (error) => setFormError(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Sign in</h1>
      <p className="mt-1 text-sm text-zinc-400">Weekly Report Generator</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {formError && (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-violet-400 hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
