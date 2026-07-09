'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateProject } from '@/hooks/useProjects';
import { getApiErrorMessage } from '@/lib/api/error';

interface NewProjectFormProps {
  onCancel: () => void;
  onCreated: () => void;
}

export function NewProjectForm({ onCancel, onCreated }: NewProjectFormProps): ReactNode {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject();

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    createProject.mutate({ name, description: description || undefined }, { onSuccess: onCreated });
  }

  return (
    <Card className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">New Project</p>
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={100}
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-20"
        />
        {createProject.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {getApiErrorMessage(createProject.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? 'Creating…' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
