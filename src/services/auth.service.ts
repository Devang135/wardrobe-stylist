import { USE_MOCK_API } from '@/services/service-config';
import { apiAuthAdapter } from '@/services/adapters/api/auth.api';
import { mockAuthAdapter } from '@/services/adapters/mock/auth.mock';
import { ApiError } from '@/services/http-client';
import type { AuthSession, UserProfile } from '@/types';

export const authService = {
  login(payload: { email: string; password: string }): Promise<AuthSession> {
    return USE_MOCK_API ? mockAuthAdapter.login(payload) : apiAuthAdapter.login(payload);
  },
  loginAsDemo(): Promise<AuthSession> {
    if (!USE_MOCK_API) {
      return Promise.reject(
        new ApiError({
          status: 400,
          code: 'DEMO_DISABLED',
          message: 'Demo sign-in is only available when mock mode is enabled.',
        }),
      );
    }
    return mockAuthAdapter.loginAsDemo();
  },
  register(payload: { name: string; email: string; password: string }): Promise<AuthSession> {
    return USE_MOCK_API ? mockAuthAdapter.register(payload) : apiAuthAdapter.register(payload);
  },
  logout(): Promise<void> {
    return USE_MOCK_API ? mockAuthAdapter.logout() : apiAuthAdapter.logout();
  },
  getCurrentUser(): Promise<UserProfile | null> {
    return USE_MOCK_API ? mockAuthAdapter.getCurrentUser() : apiAuthAdapter.getCurrentUser();
  },
  requestPasswordReset(email: string): Promise<{ message: string }> {
    return USE_MOCK_API
      ? mockAuthAdapter.requestPasswordReset(email)
      : apiAuthAdapter.requestPasswordReset(email);
  },
};
