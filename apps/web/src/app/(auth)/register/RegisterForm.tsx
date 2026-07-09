'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/api/error';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function RegisterForm(): ReactNode {
  const router = useRouter();
  const register = useRegister();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setFormError(null);
    // Registration always creates a TEAM_MEMBER (SECURITY_GUIDELINES.md §2) —
    // no role field, so there's exactly one place to land: /reports.
    register.mutate(
      { firstName, lastName, email, password },
      {
        onSuccess: () => router.replace('/reports'),
        onError: (error) => setFormError(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Create account</h1>
      <p className="mt-1 text-sm text-zinc-400">New accounts start as a team member.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="First name"
          required
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Input
          label="Last name"
          required
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
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
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {formError && (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-violet-400 underline decoration-2 underline-offset-2 font-semibold hover:text-violet-300"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
