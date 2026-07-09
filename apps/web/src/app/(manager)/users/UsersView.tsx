'use client';

import { Role } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { useUpdateUser, useUsers } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api/error';

const ROLE_LABELS: Record<Role, string> = {
  [Role.MANAGER]: 'Manager',
  [Role.TEAM_MEMBER]: 'Team Member',
};

export function UsersView(): ReactNode {
  const { data: users, isLoading, isError } = useUsers();
  const updateUser = useUpdateUser();

  function handleRoleChange(userId: string, name: string, nextRole: Role): void {
    const confirmed = window.confirm(`Change ${name}'s role to ${ROLE_LABELS[nextRole]}?`);
    if (!confirmed) return;
    updateUser.mutate({ id: userId, payload: { role: nextRole } });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Team</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Promote or demote members between roles.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : isError || !users ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t load the team. Try refreshing.
        </p>
      ) : (
        <Card className="mt-4 overflow-x-auto p-4">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b-2 border-zinc-900 dark:border-zinc-100 bg-zinc-200 dark:bg-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Email</th>
                <th className="px-4 py-2.5 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 last:border-0"
                >
                  <td className="px-4 py-2.5">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <select
                      aria-label={`Role for ${user.firstName} ${user.lastName}`}
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(
                          user.id,
                          `${user.firstName} ${user.lastName}`,
                          event.target.value as Role,
                        )
                      }
                      disabled={updateUser.isPending}
                      className="max-w-[10rem] rounded-none border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {Object.values(Role).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {updateUser.isError && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {getApiErrorMessage(updateUser.error)}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
