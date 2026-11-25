import { delay, mockDb, persistAuthFlag, resetMockDbForDemoUser, resetMockDbForNewUser } from '@/mocks/mock-db';
import { ApiError } from '@/services/http-client';
import type { AuthSession, UserProfile } from '@/types';

export const mockAuthAdapter = {
  async login(payload: { email: string; password: string }): Promise<AuthSession> {
    await delay(350);
    if (!payload.email.includes('@') || payload.password.length < 6) {
      throw new ApiError({
        status: 422,
        code: 'INVALID_CREDENTIALS',
        message: 'Please enter a valid email and a password of at least 6 characters.',
      });
    }
    resetMockDbForDemoUser();
    const user = mockDb.user!;
    return {
      token: 'demo-mock-session-token',
      user: { ...user, email: payload.email },
    };
  },

  async loginAsDemo(): Promise<AuthSession> {
    await delay(250);
    resetMockDbForDemoUser();
    return {
      token: 'demo-mock-session-token',
      user: mockDb.user!,
    };
  },

  async register(payload: { name: string; email: string; password: string }): Promise<AuthSession> {
    await delay(400);
    resetMockDbForNewUser(payload.name, payload.email);
    return {
      token: 'demo-mock-session-token',
      user: mockDb.user!,
    };
  },

  async logout(): Promise<void> {
    await delay(150);
    mockDb.isAuthenticated = false;
    mockDb.user = null;
    persistAuthFlag(false);
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(120);
    if (!mockDb.isAuthenticated || !mockDb.user) {
      return null;
    }
    return { ...mockDb.user };
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    await delay(300);
    return {
      message: `In a connected production environment, a password reset link would be sent to ${email}.`,
    };
  },
};
