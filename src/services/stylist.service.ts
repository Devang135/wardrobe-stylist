import { delay, mockDb } from '@/mocks/mock-db';
import { httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { Garment, StylistMessage, StylistRecommendation } from '@/types';

function pickFirst(garments: Garment[], predicate: (g: Garment) => boolean): Garment | undefined {
  return garments.find(predicate);
}

function buildMockRecommendations(prompt: string, occasion?: string): {
  replyText: string;
  recommendations: StylistRecommendation[];
} {
  const ready = mockDb.garments.filter((g) => g.status === 'READY');
  if (ready.length === 0) {
    return {
      replyText:
        'Your wardrobe currently has no ready items. Upload a few tops, bottoms, and shoes first so I can assemble personalized outfits for you.',
      recommendations: [],
    };
  }

  const lower = prompt.toLowerCase();
  const top =
    pickFirst(ready, (g) => g.category === 'TOP' && (lower.includes('blue') ? g.color.toLowerCase().includes('blue') : true)) ??
    pickFirst(ready, (g) => g.category === 'TOP');
  const altTop = ready.find((g) => g.category === 'TOP' && g.id !== top?.id);
  const bottom =
    pickFirst(ready, (g) => g.category === 'BOTTOM' && (lower.includes('office') ? g.subcategory === 'Trousers' : true)) ??
    pickFirst(ready, (g) => g.category === 'BOTTOM');
  const altBottom = ready.find((g) => g.category === 'BOTTOM' && g.id !== bottom?.id);
  const unwornJacket = ready.find((g) => g.category === 'OUTERWEAR' && g.wearCount === 0) ?? ready.find((g) => g.category === 'OUTERWEAR');
  const shoes =
    pickFirst(ready, (g) => g.category === 'FOOTWEAR' && (lower.includes('dinner') || lower.includes('party') ? g.subcategory !== 'Sneakers' : true)) ??
    pickFirst(ready, (g) => g.category === 'FOOTWEAR');
  const watch = ready.find((g) => g.category === 'ACCESSORY');
  const traditional = ready.find((g) => g.category === 'TRADITIONAL');

  const recs: StylistRecommendation[] = [];

  if (lower.includes('wedding') || lower.includes('traditional')) {
    if (traditional && bottom && shoes) {
      recs.push({
        id: `rec_${Date.now()}_1`,
        title: 'Refined Heritage Edit',
        rationale: `Centers on your ${traditional.name} balanced with ${bottom.name} and ${shoes.name}.`,
        occasion: occasion || 'Wedding',
        tags: ['Traditional', 'Wedding'],
        garmentIds: [traditional.id, bottom.id, shoes.id, ...(watch ? [watch.id] : [])],
      });
    }
  }

  if (top && bottom && shoes) {
    recs.push({
      id: `rec_${Date.now()}_2`,
      title: lower.includes('office')
        ? 'Smart-Casual Studio Tailoring'
        : lower.includes('dinner') || lower.includes('party')
          ? 'Evening Layered Contrast'
          : 'Balanced Everyday Capsule',
      rationale: `Pairs ${top.name} with ${bottom.name}${unwornJacket ? ` and brings in your ${unwornJacket.name}` : ''} for a cohesive silhouette.`,
      occasion: occasion || (lower.includes('office') ? 'Office' : lower.includes('dinner') ? 'Party' : 'Casual'),
      tags: [occasion || 'Minimal', 'Western'],
      garmentIds: [
        top.id,
        bottom.id,
        ...(unwornJacket ? [unwornJacket.id] : []),
        shoes.id,
        ...(watch ? [watch.id] : []),
      ],
    });
  }

  if (altTop && (altBottom || bottom) && shoes) {
    const chosenBottom = altBottom ?? bottom!;
    recs.push({
      id: `rec_${Date.now()}_3`,
      title: 'Low-Wear Discovery Pairing',
      rationale: `Rotates ${altTop.name} (${altTop.wearCount} wears) with ${chosenBottom.name} to keep your wardrobe active.`,
      occasion: occasion || 'Casual',
      tags: ['Smart Casual', 'Minimal'],
      garmentIds: [altTop.id, chosenBottom.id, shoes.id],
    });
  }

  return {
    replyText: `Here ${recs.length === 1 ? 'is a look' : `are ${recs.length} looks`} built exclusively from garments already in your digital wardrobe (simulated demo stylist):`,
    recommendations: recs,
  };
}

export const stylistService = {
  async getConversation(): Promise<StylistMessage[]> {
    if (!USE_MOCK_API) {
      return httpRequest<StylistMessage[]>('/api/stylist/messages');
    }
    await delay(150);
    return [...mockDb.stylistMessages];
  },

  async sendMessage(payload: {
    message: string;
    occasion?: string;
    style?: string;
  }): Promise<StylistMessage[]> {
    if (!USE_MOCK_API) {
      return httpRequest<StylistMessage[]>('/api/stylist/messages', {
        method: 'POST',
        body: payload,
      });
    }

    const userMessage: StylistMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: payload.message,
      createdAt: new Date().toISOString(),
    };
    mockDb.stylistMessages = [...mockDb.stylistMessages, userMessage];

    await delay(550);

    const { replyText, recommendations } = buildMockRecommendations(payload.message, payload.occasion);
    const assistantMessage: StylistMessage = {
      id: `msg_a_${Date.now()}`,
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString(),
      recommendations,
    };
    mockDb.stylistMessages = [...mockDb.stylistMessages, assistantMessage];
    return [...mockDb.stylistMessages];
  },
};
