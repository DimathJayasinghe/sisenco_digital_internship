import type { ApiResponse, Project, ProjectMember } from '@sisenco/shared-types';
import { api } from './client';

export async function getActiveProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiResponse<Project[]>>('/projects');
  return data.data;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
  return data.data;
}

export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
  const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
  return data.data;
}

/** Soft-delete (is_active = false) — DATABASE.md §3. */
export async function deleteProject(id: string): Promise<Project> {
  const { data } = await api.delete<ApiResponse<Project>>(`/projects/${id}`);
  return data.data;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
  return data.data;
}

export async function assignMember(projectId: string, userId: string): Promise<ProjectMember> {
  const { data } = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, {
    userId,
  });
  return data.data;
}

export async function unassignMember(projectId: string, userId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}
