import { createAvatarIllustration } from '@/assets/fashion-illustrations';
import { CREDIT_RULES } from '@/config/brand.config';
import { delay, mockDb } from '@/mocks/mock-db';
import { ApiError, httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { Outfit, TryOnRequestPayload, TryOnResult } from '@/types';

export const outfitService = {
  async listOutfits(): Promise<Outfit[]> {
    if (!USE_MOCK_API) {
      return httpRequest<Outfit[]>('/api/outfits');
    }
    await delay(180);
    return mockDb.outfits.map((o) => ({ ...o }));
  },

  async getOutfit(id: string): Promise<Outfit> {
    if (!USE_MOCK_API) {
      return httpRequest<Outfit>(`/api/outfits/${id}`);
    }
    await delay(140);
    const found = mockDb.outfits.find((o) => o.id === id);
    if (!found) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Outfit not found.' });
    }
    return { ...found };
  },

  async generateTryOn(payload: TryOnRequestPayload): Promise<TryOnResult> {
    if (!USE_MOCK_API) {
      return httpRequest<TryOnResult>('/api/outfits/preview', {
        method: 'POST',
        body: payload,
      });
    }

    if (mockDb.subscription.creditsRemaining < CREDIT_RULES.tryOnGenerationCost) {
      throw new ApiError({
        status: 422,
        code: 'INSUFFICIENT_CREDITS',
        message: 'You have 0 AI credits remaining. Please upgrade or add credits in Subscription.',
      });
    }

    await delay(950);

    const findColor = (id?: string) =>
      id ? mockDb.garments.find((g) => g.id === id)?.colorHex : undefined;

    const previewUrl = createAvatarIllustration({
      topColor: findColor(payload.topId) ?? '#EAE4DC',
      bottomColor: findColor(payload.bottomId) ?? '#344154',
      onePieceColor: findColor(payload.onePieceId),
      outerwearColor: findColor(payload.outerwearId),
      footwearColor: findColor(payload.footwearId) ?? '#FAF8F5',
      label: 'Try-On Preview (Demo)',
    });

    const garmentIds = [
      payload.topId,
      payload.bottomId,
      payload.onePieceId,
      payload.outerwearId,
      payload.footwearId,
      ...payload.accessoryIds,
    ].filter((id): id is string => Boolean(id));

    mockDb.subscription.creditsRemaining -= CREDIT_RULES.tryOnGenerationCost;
    mockDb.creditHistory.unshift({
      id: `crd_${Date.now()}`,
      action: 'Try-on preview generation (Demo)',
      creditsDelta: -CREDIT_RULES.tryOnGenerationCost,
      balanceAfter: mockDb.subscription.creditsRemaining,
      createdAt: new Date().toISOString(),
      referenceLabel: `${garmentIds.length} selected items`,
    });

    return {
      jobId: `job_tryon_${Date.now()}`,
      previewUrl,
      garmentIds,
      creditsCharged: CREDIT_RULES.tryOnGenerationCost,
      createdAt: new Date().toISOString(),
    };
  },

  async saveOutfit(payload: {
    name: string;
    description?: string;
    generatedImageUrl: string;
    garmentIds: string[];
    tags: string[];
    occasion?: string;
    season?: string;
    notes?: string;
  }): Promise<Outfit> {
    if (!USE_MOCK_API) {
      return httpRequest<Outfit>('/api/outfits', { method: 'POST', body: payload });
    }
    await delay(260);
    const outfit: Outfit = {
      id: `out_${Date.now()}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      name: payload.name,
      description: payload.description,
      generatedImageUrl: payload.generatedImageUrl,
      garmentIds: payload.garmentIds,
      tags: payload.tags,
      occasion: payload.occasion,
      season: payload.season ?? 'All-Season',
      favorite: false,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      notes: payload.notes,
    };
    mockDb.outfits = [outfit, ...mockDb.outfits];
    return { ...outfit };
  },

  async updateOutfit(id: string, patch: Partial<Outfit>): Promise<Outfit> {
    if (!USE_MOCK_API) {
      return httpRequest<Outfit>(`/api/outfits/${id}`, { method: 'PATCH', body: patch });
    }
    await delay(180);
    const idx = mockDb.outfits.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Outfit not found.' });
    }
    mockDb.outfits[idx] = { ...mockDb.outfits[idx], ...patch };
    return { ...mockDb.stylistMessages ? mockDb.outfits[idx] : mockDb.outfits[idx] };
  },

  async toggleFavorite(id: string): Promise<Outfit> {
    const existing = mockDb.outfits.find((o) => o.id === id);
    if (!existing) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Outfit not found.' });
    }
    return this.updateOutfit(id, { favorite: !existing.favorite });
  },

  async duplicateOutfit(id: string): Promise<Outfit> {
    if (!USE_MOCK_API) {
      return httpRequest<Outfit>(`/api/outfits/${id}/duplicate`, { method: 'POST' });
    }
    await delay(200);
    const found = mockDb.outfits.find((o) => o.id === id);
    if (!found) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Outfit not found.' });
    }
    const copy: Outfit = {
      ...found,
      id: `out_${Date.now()}`,
      name: `${found.name} (Copy)`,
      favorite: false,
      createdAt: new Date().toISOString(),
    };
    mockDb.outfits = [copy, ...mockDb.outfits];
    return { ...copy };
  },

  async deleteOutfit(id: string): Promise<void> {
    if (!USE_MOCK_API) {
      return httpRequest<void>(`/api/outfits/${id}`, { method: 'DELETE' });
    }
    await delay(180);
    mockDb.outfits = mockDb.outfits.filter((o) => o.id !== id);
    mockDb.calendarPlans = mockDb.calendarPlans.filter((c) => c.outfitId !== id);
  },
};
