import { delay, mockDb } from '@/mocks/mock-db';
import { httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { CalendarOutfitPlan } from '@/types';

export const calendarService = {
  async listPlans(): Promise<CalendarOutfitPlan[]> {
    if (!USE_MOCK_API) {
      return httpRequest<CalendarOutfitPlan[]>('/api/calendar/outfits');
    }
    await delay(160);
    return [...mockDb.calendarPlans];
  },

  async savePlan(payload: {
    date: string;
    outfitId: string;
    occasion: string;
    notes?: string;
  }): Promise<CalendarOutfitPlan> {
    if (!USE_MOCK_API) {
      return httpRequest<CalendarOutfitPlan>('/api/calendar/outfits', {
        method: 'POST',
        body: payload,
      });
    }
    await delay(200);
    const plan: CalendarOutfitPlan = {
      id: `cal_${Date.now()}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      date: payload.date,
      outfitId: payload.outfitId,
      occasion: payload.occasion,
      notes: payload.notes,
    };
    mockDb.calendarPlans = [...mockDb.calendarPlans, plan];
    return { ...plan };
  },

  async updatePlan(
    id: string,
    patch: Partial<Pick<CalendarOutfitPlan, 'outfitId' | 'occasion' | 'notes' | 'date'>>,
  ): Promise<CalendarOutfitPlan> {
    if (!USE_MOCK_API) {
      return httpRequest<CalendarOutfitPlan>(`/api/calendar/outfits/${id}`, {
        method: 'PATCH',
        body: patch,
      });
    }
    await delay(160);
    const idx = mockDb.calendarPlans.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Calendar plan not found');
    mockDb.calendarPlans[idx] = { ...mockDb.calendarPlans[idx], ...patch };
    return { ...mockDb.calendarPlans[idx] };
  },

  async removePlan(id: string): Promise<void> {
    if (!USE_MOCK_API) {
      return httpRequest<void>(`/api/calendar/outfits/${id}`, { method: 'DELETE' });
    }
    await delay(160);
    mockDb.calendarPlans = mockDb.calendarPlans.filter((p) => p.id !== id);
  },
};
