import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { UserProfile } from '@/types';

export const AUTH_QUERY_KEY = ['auth', 'current-user'] as const;

export function useCurrentUser() {
  return useQuery<UserProfile | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 60_000,
  });
}

export function useAuthActions() {
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) => authService.login(payload),
    onSuccess: (session) => {
      qc.setQueryData(AUTH_QUERY_KEY, session.user);
      void qc.invalidateQueries();
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: () => authService.loginAsDemo(),
    onSuccess: (session) => {
      qc.setQueryData(AUTH_QUERY_KEY, session.user);
      void qc.invalidateQueries();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      authService.register(payload),
    onSuccess: (session) => {
      qc.setQueryData(AUTH_QUERY_KEY, session.user);
      void qc.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      qc.setQueryData(AUTH_QUERY_KEY, null);
      qc.clear();
    },
  });

  return {
    loginMutation,
    demoLoginMutation,
    registerMutation,
    logoutMutation,
  };
}
