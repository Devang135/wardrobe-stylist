import { createGarmentIllustration } from '@/assets/fashion-illustrations';
import { delay, mockDb } from '@/mocks/mock-db';
import { ApiError, httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { Garment, GarmentCategory } from '@/types';

export interface SuggestedGarmentDraft {
  tempId: string;
  fileName: string;
  originalPreviewUrl: string;
  cleanedPreviewUrl: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  colorHex: string;
  pattern: string;
  styleTags: string[];
  occasionTags: string[];
  seasonTags: string[];
}

const SUGGESTION_PRESETS: Array<{
  keyword: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  colorHex: string;
  pattern: string;
}> = [
  {
    keyword: 'shirt',
    name: 'Tailored Poplin Shirt',
    category: 'TOP',
    subcategory: 'Shirt',
    color: 'Ivory',
    colorHex: '#EFEAE0',
    pattern: 'Solid',
  },
  {
    keyword: 'tee',
    name: 'Relaxed Cotton Tee',
    category: 'TOP',
    subcategory: 'T-shirt',
    color: 'Sage',
    colorHex: '#7A8C77',
    pattern: 'Solid',
  },
  {
    keyword: 'jean',
    name: 'Straight Indigo Denim',
    category: 'BOTTOM',
    subcategory: 'Jeans',
    color: 'Indigo',
    colorHex: '#34465E',
    pattern: 'Solid',
  },
  {
    keyword: 'pant',
    name: 'Pleated Tailored Trousers',
    category: 'BOTTOM',
    subcategory: 'Trousers',
    color: 'Charcoal',
    colorHex: '#3B3936',
    pattern: 'Solid',
  },
  {
    keyword: 'jacket',
    name: 'Structured Studio Jacket',
    category: 'OUTERWEAR',
    subcategory: 'Jacket',
    color: 'Terracotta',
    colorHex: '#B55D42',
    pattern: 'Solid',
  },
  {
    keyword: 'shoe',
    name: 'Minimal Leather Sneakers',
    category: 'FOOTWEAR',
    subcategory: 'Sneakers',
    color: 'Ivory',
    colorHex: '#EDE8DF',
    pattern: 'Solid',
  },
  {
    keyword: 'kurta',
    name: 'Festive Woven Kurta',
    category: 'TRADITIONAL',
    subcategory: 'Kurta',
    color: 'Sandstone',
    colorHex: '#D8C5A8',
    pattern: 'Textured',
  },
  {
    keyword: 'dress',
    name: 'Draped Midi Dress',
    category: 'ONE_PIECE',
    subcategory: 'Midi Dress',
    color: 'Olive',
    colorHex: '#687660',
    pattern: 'Solid',
  },
];

export const wardrobeService = {
  async listItems(options?: { includeArchived?: boolean }): Promise<Garment[]> {
    if (!USE_MOCK_API) {
      return httpRequest<Garment[]>('/api/wardrobe/items');
    }
    await delay(200);
    const items = options?.includeArchived
      ? mockDb.garments
      : mockDb.garments.filter((g) => g.status !== 'ARCHIVED');
    return items.map((g) => ({ ...g }));
  },

  async getItem(id: string): Promise<Garment> {
    if (!USE_MOCK_API) {
      return httpRequest<Garment>(`/api/wardrobe/items/${id}`);
    }
    await delay(140);
    const item = mockDb.garments.find((g) => g.id === id);
    if (!item) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Garment not found.' });
    }
    return { ...item };
  },

  async toggleFavorite(id: string): Promise<Garment> {
    if (!USE_MOCK_API) {
      return httpRequest<Garment>(`/api/wardrobe/items/${id}`, {
        method: 'PATCH',
        body: { toggleFavorite: true },
      });
    }
    await delay(120);
    const idx = mockDb.garments.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Garment not found.' });
    }
    mockDb.garments[idx] = {
      ...mockDb.garments[idx],
      favorite: !mockDb.garments[idx].favorite,
    };
    return { ...mockDb.garments[idx] };
  },

  async updateItem(id: string, patch: Partial<Garment>): Promise<Garment> {
    if (!USE_MOCK_API) {
      return httpRequest<Garment>(`/api/wardrobe/items/${id}`, {
        method: 'PATCH',
        body: patch,
      });
    }
    await delay(220);
    const idx = mockDb.garments.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Garment not found.' });
    }
    mockDb.garments[idx] = { ...mockDb.garments[idx], ...patch };
    return { ...mockDb.garments[idx] };
  },

  async archiveItem(id: string): Promise<Garment> {
    return this.updateItem(id, { status: 'ARCHIVED' });
  },

  async deleteItem(id: string): Promise<void> {
    if (!USE_MOCK_API) {
      return httpRequest<void>(`/api/wardrobe/items/${id}`, { method: 'DELETE' });
    }
    await delay(200);
    mockDb.garments = mockDb.garments.filter((g) => g.id !== id);
  },

  /**
   * Simulated demo garment analysis & background cleanup.
   * In production, this delegates to POST /api/wardrobe/upload-url and backend processing.
   */
  async simulateProcessUploadedFile(params: {
    tempId: string;
    fileName: string;
    objectUrl: string;
    index: number;
    simulateError?: boolean;
  }): Promise<SuggestedGarmentDraft> {
    if (!USE_MOCK_API) {
      return httpRequest<SuggestedGarmentDraft>('/api/wardrobe/upload-url', {
        method: 'POST',
        body: { fileName: params.fileName },
      });
    }

    await delay(550 + (params.index % 3) * 200);

    if (params.simulateError) {
      throw new ApiError({
        status: 422,
        code: 'SIMULATED_RECOGNITION_ERROR',
        message: `Demo processing failed for "${params.fileName}". You can retry without losing other items.`,
      });
    }

    const lower = params.fileName.toLowerCase();
    const matched =
      SUGGESTION_PRESETS.find((p) => lower.includes(p.keyword)) ??
      SUGGESTION_PRESETS[params.index % SUGGESTION_PRESETS.length];

    const cleanedPreviewUrl = createGarmentIllustration({
      category: matched.category,
      subcategory: matched.subcategory,
      colorHex: matched.colorHex,
      pattern: matched.pattern,
    });

    return {
      tempId: params.tempId,
      fileName: params.fileName,
      originalPreviewUrl: params.objectUrl,
      cleanedPreviewUrl,
      name: matched.name,
      category: matched.category,
      subcategory: matched.subcategory,
      color: matched.color,
      colorHex: matched.colorHex,
      pattern: matched.pattern,
      styleTags: ['Minimal', 'Smart Casual'],
      occasionTags: ['Daily', 'Office'],
      seasonTags: ['All-Season'],
    };
  },

  async createItemsFromDrafts(drafts: SuggestedGarmentDraft[]): Promise<Garment[]> {
    if (!USE_MOCK_API) {
      return httpRequest<Garment[]>('/api/wardrobe/items/complete', {
        method: 'POST',
        body: { items: drafts },
      });
    }
    await delay(300);
    const created: Garment[] = drafts.map((d, idx) => ({
      id: `grm_${Date.now()}_${idx}`,
      userId: mockDb.user?.id ?? 'usr_demo',
      name: d.name,
      category: d.category,
      subcategory: d.subcategory,
      imageUrl: d.cleanedPreviewUrl,
      originalImageUrl: d.originalPreviewUrl,
      color: d.color,
      colorHex: d.colorHex,
      pattern: d.pattern,
      styleTags: d.styleTags,
      occasionTags: d.occasionTags,
      seasonTags: d.seasonTags,
      favorite: false,
      status: 'READY',
      wearCount: 0,
      createdAt: new Date().toISOString(),
      notes: 'Added via simulated studio upload.',
    }));
    mockDb.garments = [...created, ...mockDb.garments];
    return created;
  },
};
