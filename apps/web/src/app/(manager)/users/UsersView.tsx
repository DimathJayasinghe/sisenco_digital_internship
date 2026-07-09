'use client';

import { Role, type User } from '@sisenco/shared-types';
import { Search } from 'lucide-react';
import { Fragment, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useUpdateUser, useUsers } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api/error';

const ROLE_LABELS: Record<Role, string> = {
  [Role.MANAGER]: 'Manager',
  [Role.TEAM_MEMBER]: 'Team Member',
};

interface PendingRoleChange {
  user: User;
  nextRole: Role;
}

export function UsersView(): ReactNode {
  const { data: users, isLoading, isError } = useUsers();
  const updateUser = useUpdateUser();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, search]);

  function handleConfirmRoleChange(): void {
    if (!pendingRoleChange) return;
    updateUser.mutate({
      id: pendingRoleChange.user.id,
      payload: { role: pendingRoleChange.nextRole },
    });
    setPendingRoleChange(null);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Team</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Promote or demote members, or update their name.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : isError || !users ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t load the team. Try refreshing.
        </p>
      ) : (
        <Card className="mt-4 p-4">
          <div className="relative max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400"
              aria-hidden
            />
            <Input
              label="Search team"
              className="pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="mt-4 max-h-[32rem] overflow-y-auto overflow-x-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">
                No team members match &ldquo;{search}&rdquo;.
              </p>
            ) : (
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0">
                  <tr className="border-b-2 border-zinc-900 bg-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300">
                    <th className="px-4 py-2.5 text-left">Name</th>
                    <th className="px-4 py-2.5 text-left">Email</th>
                    <th className="px-4 py-2.5 text-left">Role</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isEditing={editingId === user.id}
                      onToggleEdit={() =>
                        setEditingId((current) => (current === user.id ? null : user.id))
                      }
                      onCloseEdit={() => setEditingId(null)}
                      onRequestRoleChange={(nextRole) => setPendingRoleChange({ user, nextRole })}
                      roleChangePending={
                        updateUser.isPending && pendingRoleChange?.user.id === user.id
                      }
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {updateUser.isError && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {getApiErrorMessage(updateUser.error)}
            </p>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={pendingRoleChange !== null}
        title="Change role?"
        description={
          pendingRoleChange
            ? `Change ${pendingRoleChange.user.firstName} ${pendingRoleChange.user.lastName}'s role to ${ROLE_LABELS[pendingRoleChange.nextRole]}?`
            : ''
        }
        confirmLabel="Change role"
        onConfirm={handleConfirmRoleChange}
        onCancel={() => setPendingRoleChange(null)}
      />
    </div>
  );
}

interface UserRowProps {
  user: User;
  isEditing: boolean;
  onToggleEdit: () => void;
  onCloseEdit: () => void;
  onRequestRoleChange: (nextRole: Role) => void;
  roleChangePending: boolean;
}

function UserRow({
  user,
  isEditing,
  onToggleEdit,
  onCloseEdit,
  onRequestRoleChange,
  roleChangePending,
}: UserRowProps): ReactNode {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const updateUser = useUpdateUser();

  function handleSave(event: FormEvent): void {
    event.preventDefault();
    updateUser.mutate(
      { id: user.id, payload: { firstName, lastName } },
      { onSuccess: onCloseEdit },
    );
  }

  return (
    <Fragment>
      <tr className="border-b border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
        <td className="px-4 py-2.5">
          {user.firstName} {user.lastName}
        </td>
        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{user.email}</td>
        <td className="px-4 py-2.5">
          <select
            aria-label={`Role for ${user.firstName} ${user.lastName}`}
            value={user.role}
            onChange={(event) => onRequestRoleChange(event.target.value as Role)}
            disabled={roleChangePending}
            className="max-w-[10rem] rounded-none border-2 border-zinc-900 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {Object.values(Role).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-2.5 text-right">
          <Button
            type="button"
            variant="ghost"
            aria-label={`Edit ${user.firstName} ${user.lastName}`}
            onClick={onToggleEdit}
          >
            Edit
          </Button>
        </td>
      </tr>
      {isEditing && (
        <tr className="border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
          <td colSpan={4} className="px-4 py-4">
            <form onSubmit={handleSave} className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Edit Name
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              {updateUser.isError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {getApiErrorMessage(updateUser.error)}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCloseEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
