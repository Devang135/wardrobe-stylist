import { httpRequest } from '@/services/http-client';
import type { AuthSession, UserProfile } from '@/types';

export const apiAuthAdapter = {
  login(payload: { email: string; password: string }): Promise<AuthSession> {
    return httpRequest<AuthSession>('/api/auth/login', { method: 'POST', body: payload });
  },
  register(payload: { name: string; email: string; password: string }): Promise<AuthSession> {
    return httpRequest<AuthSession>('/api/auth/register', { method: 'POST', body: payload });
  },
  logout(): Promise<void> {
    return httpRequest<void>('/api/auth/logout', { method: 'POST' });
  },
  getCurrentUser(): Promise<UserProfile | null> {
    return httpRequest<UserProfile>('/api/users/me', { method: 'GET' });
  },
  requestPasswordReset(email: string): Promise<{ message: string }> {
    return httpRequest<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },
};
