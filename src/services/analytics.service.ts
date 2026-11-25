import { CATEGORY_LABELS } from '@/lib/format';
import { delay, mockDb } from '@/mocks/mock-db';
import { httpRequest } from '@/services/http-client';
import { USE_MOCK_API } from '@/services/service-config';
import type { AnalyticsOverview, GarmentCategory } from '@/types';

const ALL_CATEGORIES: GarmentCategory[] = [
  'TOP',
  'BOTTOM',
  'ONE_PIECE',
  'OUTERWEAR',
  'FOOTWEAR',
  'ACCESSORY',
  'TRADITIONAL',
];

export const analyticsService = {
  async getOverview(range: '30d' | '90d' | 'all' = '90d'): Promise<AnalyticsOverview> {
    if (!USE_MOCK_API) {
      return httpRequest<AnalyticsOverview>(`/api/analytics/overview?range=${range}`);
    }
    await delay(220);

    const active = mockDb.garments.filter((g) => g.status === 'READY');
    const archived = mockDb.garments.filter((g) => g.status === 'ARCHIVED');

    const categoryBreakdown = ALL_CATEGORIES.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      count: active.filter((g) => g.category === category).length,
    })).filter((entry) => entry.count > 0);

    const sortedByWearDesc = [...active].sort((a, b) => b.wearCount - a.wearCount);
    const sortedByWearAsc = [...active].sort((a, b) => a.wearCount - b.wearCount);

    const wornCount = active.filter((g) => g.wearCount > 0).length;
    const utilizationRate = active.length > 0 ? Math.round((wornCount / active.length) * 100) : 0;

    const occasionMap = new Map<string, number>();
    for (const outfit of mockDb.outfits) {
      const occ = outfit.occasion ?? 'Unspecified';
      occasionMap.set(occ, (occasionMap.get(occ) ?? 0) + 1);
    }
    const outfitsByOccasion = Array.from(occasionMap.entries()).map(([occasion, count]) => ({
      occasion,
      count,
    }));

    const scale = range === '30d' ? 1 : range === '90d' ? 1 : 1.25;
    const generationActivity =
      range === '30d'
        ? [
            { month: 'Week 1', tryOns: 4, savedOutfits: 1 },
            { month: 'Week 2', tryOns: 6, savedOutfits: 2 },
            { month: 'Week 3', tryOns: 5, savedOutfits: 2 },
            { month: 'Week 4', tryOns: 7, savedOutfits: 1 },
          ]
        : [
            { month: 'Aug', tryOns: Math.round(9 * scale), savedOutfits: 2 },
            { month: 'Sep', tryOns: Math.round(14 * scale), savedOutfits: 3 },
            { month: 'Oct', tryOns: Math.round(18 * scale), savedOutfits: 4 },
            { month: 'Nov', tryOns: Math.round(22 * scale), savedOutfits: mockDb.outfits.length },
          ];

    const costPerWearLeaders = active
      .filter((g) => typeof g.purchasePriceInr === 'number' && g.wearCount > 0)
      .map((g) => ({
        garmentId: g.id,
        name: g.name,
        wearCount: g.wearCount,
        purchasePriceInr: g.purchasePriceInr!,
        costPerWearInr: Math.round(g.purchasePriceInr! / g.wearCount),
      }))
      .sort((a, b) => a.costPerWearInr - b.costPerWearInr)
      .slice(0, 5);

    return {
      totalItems: mockDb.garments.length,
      activeItems: active.length,
      archivedItems: archived.length,
      totalOutfits: mockDb.outfits.length,
      utilizationRate,
      categoryBreakdown,
      mostWornGarments: sortedByWearDesc.slice(0, 5),
      leastWornGarments: sortedByWearAsc.slice(0, 5),
      outfitsByOccasion,
      generationActivity,
      costPerWearLeaders,
    };
  },
};
