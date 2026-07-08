import type { ApiResponse, User } from '@sisenco/shared-types';
import { api } from './client';

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<ApiResponse<User[]>>('/users');
  return data.data;
}
