'use client';

import { Role } from '@sisenco/shared-types';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useChangePassword, useCurrentUser } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api/error';

const ROLE_LABELS: Record<Role, string> = {
  [Role.MANAGER]: 'Manager',
  [Role.TEAM_MEMBER]: 'Team Member',
};

/** Success message shown after a save, then cleared — a lightweight
 * confirmation for a standalone settings page (no toast system in this app). */
function useSavedFlash(): [boolean, () => void] {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);
  return [saved, () => setSaved(true)];
}

export function ProfileView(): ReactNode {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <p className="p-6 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>;
  }
  if (isError || !user) {
    return (
      <p className="p-6 text-sm text-red-600 dark:text-red-400">
        Couldn&apos;t load your profile. Try refreshing.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Profile
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {user.email} &middot; {ROLE_LABELS[user.role]}
      </p>

      <div className="mt-6 space-y-6">
        <NameCard firstName={user.firstName} lastName={user.lastName} />
        <PasswordCard />
      </div>
    </div>
  );
}

interface NameCardProps {
  firstName: string;
  lastName: string;
}

function NameCard({
  firstName: initialFirstName,
  lastName: initialLastName,
}: NameCardProps): ReactNode {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const updateProfile = useUpdateProfile();
  const [saved, flashSaved] = useSavedFlash();

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    updateProfile.mutate({ firstName, lastName }, { onSuccess: flashSaved });
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
        Your Details
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            maxLength={100}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            maxLength={100}
          />
        </div>
        {updateProfile.isError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(updateProfile.error)}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved</span>}
        </div>
      </form>
    </Card>
  );
}

function PasswordCard(): ReactNode {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mismatchError, setMismatchError] = useState<string | null>(null);
  const changePassword = useChangePassword();
  const [saved, flashSaved] = useSavedFlash();

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    setMismatchError(null);
    if (newPassword !== confirmPassword) {
      setMismatchError('New password and confirmation do not match.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          flashSaved();
        },
      },
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        {(mismatchError || changePassword.isError) && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {mismatchError ?? getApiErrorMessage(changePassword.error)}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Updating…' : 'Update password'}
          </Button>
          {saved && <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved</span>}
        </div>
      </form>
    </Card>
  );
}
