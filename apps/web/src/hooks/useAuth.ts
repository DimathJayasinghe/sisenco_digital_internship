import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@sisenco/shared-types';
import * as authApi from '@/lib/api/auth';

/** Shared query key for the current session — read here, written by login/register/logout. */
export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

/** Current session. Do not retry on failure — a 401 just means "not logged in." */
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Full cache clear, not just the auth key — nothing from this session
      // should leak into the next one on a shared machine.
      queryClient.clear();
    },
  });
}
