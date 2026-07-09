'use client';

import type { Project, User } from '@sisenco/shared-types';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Fragment, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const [search, setSearch] = useState('');
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const deleteProject = useDeleteProject();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query) ?? false),
    );
  }, [projects, search]);

  function handleConfirmDelete(): void {
    if (!deletingProject) return;
    deleteProject.mutate(deletingProject.id);
    setDeletingProject(null);
  }

  if (projects.length === 0) {
    return <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">No active projects yet.</p>;
  }

  return (
    <>
      <Card className="mt-4 p-4">
        <div className="max-w-xs">
          <Input
            label="Search projects"
            icon={<Search size={16} />}
            placeholder="Search by name or description…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[32rem] overflow-y-auto overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">
              No projects match &ldquo;{search}&rdquo;.
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0">
                <tr className="border-b-2 border-zinc-900 bg-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:border-zinc-300 dark:bg-zinc-700 dark:text-zinc-300">
                  <th className="w-8 px-4 py-2.5" aria-hidden />
                  <th className="px-4 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Description</th>
                  <th className="px-4 py-2.5 text-left">Created</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    users={users}
                    isExpanded={expandedId === project.id}
                    onToggle={() =>
                      setExpandedId((current) => (current === project.id ? null : project.id))
                    }
                    onRequestDelete={() => setDeletingProject(project)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={deletingProject !== null}
        title="Delete project?"
        description={
          deletingProject
            ? `"${deletingProject.name}" will be hidden from new reports. Past reports on this project are preserved.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </>
  );
}

interface ProjectRowProps {
  project: Project;
  users: User[];
  isExpanded: boolean;
  onToggle: () => void;
  onRequestDelete: () => void;
}

function ProjectRow({
  project,
  users,
  isExpanded,
  onToggle,
  onRequestDelete,
}: ProjectRowProps): ReactNode {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const updateProject = useUpdateProject();

  function handleSave(event: FormEvent): void {
    event.preventDefault();
    updateProject.mutate(
      { id: project.id, payload: { name, description: description || undefined } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <Fragment>
      <tr className="border-b border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${project.name}`}
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
        <td className="px-4 py-2.5 font-medium">{project.name}</td>
        <td className="max-w-xs truncate px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
          {project.description ?? '—'}
        </td>
        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
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
              aria-label={`Edit ${project.name}`}
              onClick={() => {
                setIsEditing((current) => !current);
                if (!isExpanded) onToggle();
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label={`Delete ${project.name}`}
              onClick={onRequestDelete}
            >
              Delete
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
          <td colSpan={5} className="space-y-6 px-4 py-4">
            {isEditing && (
              <form onSubmit={handleSave} className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
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
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {getApiErrorMessage(updateProject.error)}
                  </p>
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
