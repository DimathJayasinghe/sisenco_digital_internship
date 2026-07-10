import type { ApiResponse, User } from '@sisenco/shared-types';
import { api } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/register', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.patch('/auth/change-password', payload);
}
