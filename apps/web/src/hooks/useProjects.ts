import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/lib/api/projects';
import type { UpdateProjectPayload } from '@/lib/api/projects';

const PROJECTS_KEY = ['projects'] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: projectsApi.getActiveProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectsApi.updateProject(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => projectsApi.getProjectMembers(projectId),
  });
}

export function useAssignMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.assignMember(projectId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}

export function useUnassignMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.unassignMember(projectId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}
