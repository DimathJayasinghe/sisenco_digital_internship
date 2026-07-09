import type { ApiResponse, Role, User } from '@sisenco/shared-types';
import { api } from './client';

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<ApiResponse<User[]>>('/users');
  return data.data;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
  return data.data;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>('/users/me', payload);
  return data.data;
}
