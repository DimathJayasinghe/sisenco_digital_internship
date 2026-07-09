'use client';

import { useState, type ReactNode } from 'react';
import { NewProjectForm } from '@/components/projects/NewProjectForm';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';

export function ProjectsView(): ReactNode {
  const [isCreating, setIsCreating] = useState(false);
  const projects = useProjects();
  const users = useUsers();

  const isLoading = projects.isLoading || users.isLoading;
  const isError = projects.isError || users.isError;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage project tags and which members can report against them.
          </p>
        </div>
        {!isCreating && <Button onClick={() => setIsCreating(true)}>New Project</Button>}
      </div>

      {isCreating && (
        <NewProjectForm
          onCancel={() => setIsCreating(false)}
          onCreated={() => setIsCreating(false)}
        />
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : isError || !projects.data || !users.data ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t load projects. Try refreshing.
        </p>
      ) : (
        <ProjectsTable projects={projects.data} users={users.data} />
      )}
    </div>
  );
}
