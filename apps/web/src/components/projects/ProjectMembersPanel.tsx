'use client';

import { Role, type User } from '@sisenco/shared-types';
import { X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useAssignMember, useProjectMembers, useUnassignMember } from '@/hooks/useProjects';
import { getApiErrorMessage } from '@/lib/api/error';

interface ProjectMembersPanelProps {
  projectId: string;
  users: User[];
}

/** Member assignment editor for one project — ARCHITECTURE.md §3 optional restriction. */
export function ProjectMembersPanel({ projectId, users }: ProjectMembersPanelProps): ReactNode {
  const { data: members, isLoading, isError } = useProjectMembers(projectId);
  const assignMember = useAssignMember(projectId);
  const unassignMember = useUnassignMember(projectId);
  const [selectedUserId, setSelectedUserId] = useState('');

  const assignedIds = new Set((members ?? []).map((member) => member.userId));
  const assignableUsers = users.filter(
    (user) => user.role === Role.TEAM_MEMBER && !assignedIds.has(user.id),
  );

  function handleAssign(): void {
    if (!selectedUserId) return;
    assignMember.mutate(selectedUserId, { onSuccess: () => setSelectedUserId('') });
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Assigned Members</p>
      <p className="mt-1 text-xs text-zinc-400">
        Unrestricted if no members are assigned — any team member can tag reports to this project.
      </p>

      {isLoading ? (
        <p className="mt-3 text-sm text-zinc-400">Loading…</p>
      ) : isError ? (
        <p className="mt-3 text-sm text-red-400">Couldn&apos;t load members.</p>
      ) : members && members.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between rounded-none border-2 border-zinc-100 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            >
              <span>
                {member.user.firstName} {member.user.lastName}
              </span>
              <button
                type="button"
                onClick={() => unassignMember.mutate(member.userId)}
                disabled={unassignMember.isPending}
                aria-label={`Unassign ${member.user.firstName} ${member.user.lastName}`}
                className="text-zinc-400 transition-colors hover:text-red-400 disabled:pointer-events-none disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">No members assigned yet.</p>
      )}

      {assignableUsers.length > 0 && (
        <div className="mt-4 flex items-end gap-2">
          <Select
            label="Add member"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="max-w-xs"
          >
            <option value="">Select a team member…</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAssign}
            disabled={!selectedUserId || assignMember.isPending}
          >
            Assign
          </Button>
        </div>
      )}

      {(assignMember.isError || unassignMember.isError) && (
        <p className="mt-2 text-xs text-red-400">
          {getApiErrorMessage(assignMember.error ?? unassignMember.error)}
        </p>
      )}
    </div>
  );
}
