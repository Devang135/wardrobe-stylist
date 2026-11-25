import { httpRequest } from '@/services/http-client';
import { delay, mockDb, persistAuthFlag } from '@/mocks/mock-db';
import { USE_MOCK_API } from '@/services/service-config';
import type { NotificationItem, NotificationPreferences, UserProfile } from '@/types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    if (!USE_MOCK_API) {
      return httpRequest<UserProfile>('/api/users/me');
    }
    await delay(150);
    if (!mockDb.user) throw new Error('Not authenticated');
    return { ...mockDb.user };
  },

  async updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    if (!USE_MOCK_API) {
      return httpRequest<UserProfile>('/api/users/me', { method: 'PATCH', body: patch });
    }
    await delay(260);
    if (!mockDb.user) throw new Error('Not authenticated');
    mockDb.user = { ...mockDb.user, ...patch };
    return { ...mockDb.user };
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    if (!USE_MOCK_API) {
      return httpRequest<NotificationPreferences>('/api/users/me/notifications');
    }
    await delay(140);
    return { ...mockDb.notificationPrefs };
  },

  async updateNotificationPreferences(
    patch: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    if (!USE_MOCK_API) {
      return httpRequest<NotificationPreferences>('/api/users/me/notifications', {
        method: 'PATCH',
        body: patch,
      });
    }
    await delay(240);
    mockDb.notificationPrefs = { ...mockDb.notificationPrefs, ...patch };
    return { ...mockDb.notificationPrefs };
  },

  async getNotifications(): Promise<NotificationItem[]> {
    if (!USE_MOCK_API) {
      return httpRequest<NotificationItem[]>('/api/notifications');
    }
    await delay(120);
    return [...mockDb.notifications];
  },

  async markAllNotificationsRead(): Promise<NotificationItem[]> {
    if (!USE_MOCK_API) {
      return httpRequest<NotificationItem[]>('/api/notifications/read-all', { method: 'POST' });
    }
    await delay(120);
    mockDb.notifications = mockDb.notifications.map((n) => ({ ...n, read: true }));
    return [...mockDb.notifications];
  },

  async exportUserData(): Promise<{ exportedAt: string; payload: string }> {
    if (!USE_MOCK_API) {
      return httpRequest<{ exportedAt: string; payload: string }>('/api/users/me/export', {
        method: 'POST',
      });
    }
    await delay(400);
    const snapshot = {
      exportedAt: new Date().toISOString(),
      note: 'Demo export generated from local mock state',
      profile: mockDb.user,
      garmentCount: mockDb.garments.length,
      outfitCount: mockDb.outfits.length,
    };
    return {
      exportedAt: snapshot.exportedAt,
      payload: JSON.stringify(snapshot, null, 2),
    };
  },

  async deleteAccount(): Promise<void> {
    if (!USE_MOCK_API) {
      return httpRequest<void>('/api/users/me', { method: 'DELETE' });
    }
    await delay(450);
    mockDb.isAuthenticated = false;
    mockDb.user = null;
    mockDb.garments = [];
    mockDb.outfits = [];
    mockDb.avatar = null;
    persistAuthFlag(false);
  },
};
