'use client';

import type { Project, User } from '@sisenco/shared-types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useState, type FormEvent, type ReactNode } from 'react';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useDeleteProject, useUpdateProject } from '@/hooks/useProjects';
import { getApiErrorMessage } from '@/lib/api/error';

interface ProjectsTableProps {
  projects: Project[];
  users: User[];
}

export function ProjectsTable({ projects, users }: ProjectsTableProps): ReactNode {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (projects.length === 0) {
    return <p className="py-6 text-sm text-zinc-500">No active projects yet.</p>;
  }

  return (
    <Card className="mt-4 overflow-x-auto p-4">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-xs font-medium uppercase tracking-wider text-zinc-400">
            <th className="w-8 px-4 py-2.5" aria-hidden />
            <th className="px-4 py-2.5 text-left">Name</th>
            <th className="px-4 py-2.5 text-left">Description</th>
            <th className="px-4 py-2.5 text-left">Created</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              users={users}
              isExpanded={expandedId === project.id}
              onToggle={() =>
                setExpandedId((current) => (current === project.id ? null : project.id))
              }
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface ProjectRowProps {
  project: Project;
  users: User[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ProjectRow({ project, users, isExpanded, onToggle }: ProjectRowProps): ReactNode {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function handleSave(event: FormEvent): void {
    event.preventDefault();
    updateProject.mutate(
      { id: project.id, payload: { name, description: description || undefined } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  function handleDelete(): void {
    if (window.confirm(`Delete "${project.name}"? Past reports will be preserved.`)) {
      deleteProject.mutate(project.id);
    }
  }

  return (
    <Fragment>
      <tr className="border-b border-white/5 text-zinc-200">
        <td className="px-4 py-2.5 text-zinc-500">
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="transition-colors hover:text-zinc-100"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
        <td className="px-4 py-2.5 font-medium">{project.name}</td>
        <td className="max-w-xs truncate px-4 py-2.5 text-zinc-400">
          {project.description ?? '—'}
        </td>
        <td className="px-4 py-2.5 text-zinc-400">
          {new Date(project.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing((current) => !current);
                if (!isExpanded) onToggle();
              }}
            >
              Edit
            </Button>
            <Button type="button" variant="ghost" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-white/5 bg-white/[0.02]">
          <td colSpan={5} className="space-y-6 px-4 py-4">
            {isEditing && (
              <form onSubmit={handleSave} className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Edit Project
                </p>
                <Input
                  label="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-20"
                />
                {updateProject.isError && (
                  <p className="text-xs text-red-400">{getApiErrorMessage(updateProject.error)}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProject.isPending}>
                    {updateProject.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </form>
            )}
            <ProjectMembersPanel projectId={project.id} users={users} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
