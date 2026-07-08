import type { ApiResponse, Project } from '@sisenco/shared-types';
import { api } from './client';

export async function getActiveProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiResponse<Project[]>>('/projects');
  return data.data;
}
