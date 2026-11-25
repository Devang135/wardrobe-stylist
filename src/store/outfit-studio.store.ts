import { create } from 'zustand';
import type { Garment } from '@/types';

export interface OutfitStudioSelection {
  topId?: string;
  bottomId?: string;
  onePieceId?: string;
  outerwearId?: string;
  footwearId?: string;
  accessoryIds: string[];
}

interface OutfitStudioState {
  selection: OutfitStudioSelection;
  lastPreviewUrl?: string;
  lastPreviewGarmentIds: string[];
  selectGarment: (garment: Garment) => void;
  removeSlot: (slot: 'topId' | 'bottomId' | 'onePieceId' | 'outerwearId' | 'footwearId') => void;
  removeAccessory: (id: string) => void;
  loadFromGarments: (garments: Garment[]) => void;
  clearSelection: () => void;
  setPreview: (url: string, garmentIds: string[]) => void;
  clearPreview: () => void;
}

const EMPTY_SELECTION: OutfitStudioSelection = {
  accessoryIds: [],
};

export const useOutfitStudioStore = create<OutfitStudioState>((set) => ({
  selection: EMPTY_SELECTION,
  lastPreviewUrl: undefined,
  lastPreviewGarmentIds: [],

  selectGarment: (garment) =>
    set((state) => {
      const next = { ...state.selection, accessoryIds: [...state.selection.accessoryIds] };

      switch (garment.category) {
        case 'TOP':
        case 'TRADITIONAL':
          next.onePieceId = undefined;
          next.topId = next.topId === garment.id ? undefined : garment.id;
          break;
        case 'BOTTOM':
          next.onePieceId = undefined;
          next.bottomId = next.bottomId === garment.id ? undefined : garment.id;
          break;
        case 'ONE_PIECE':
          next.topId = undefined;
          next.bottomId = undefined;
          next.onePieceId = next.onePieceId === garment.id ? undefined : garment.id;
          break;
        case 'OUTERWEAR':
          next.outerwearId = next.outerwearId === garment.id ? undefined : garment.id;
          break;
        case 'FOOTWEAR':
          next.footwearId = next.footwearId === garment.id ? undefined : garment.id;
          break;
        case 'ACCESSORY':
          if (next.accessoryIds.includes(garment.id)) {
            next.accessoryIds = next.accessoryIds.filter((id) => id !== garment.id);
          } else {
            next.accessoryIds.push(garment.id);
          }
          break;
      }
      return { selection: next };
    }),

  removeSlot: (slot) =>
    set((state) => ({
      selection: {
        ...state.selection,
        [slot]: undefined,
      },
    })),

  removeAccessory: (id) =>
    set((state) => ({
      selection: {
        ...state.selection,
        accessoryIds: state.selection.accessoryIds.filter((a) => a !== id),
      },
    })),

  loadFromGarments: (garments) =>
    set(() => {
      const next: OutfitStudioSelection = { accessoryIds: [] };
      for (const g of garments) {
        if (g.status === 'ARCHIVED') continue;
        if (g.category === 'ONE_PIECE') {
          next.onePieceId = g.id;
          next.topId = undefined;
          next.bottomId = undefined;
        } else if ((g.category === 'TOP' || g.category === 'TRADITIONAL') && !next.onePieceId) {
          next.topId = g.id;
        } else if (g.category === 'BOTTOM' && !next.onePieceId) {
          next.bottomId = g.id;
        } else if (g.category === 'OUTERWEAR') {
          next.outerwearId = g.id;
        } else if (g.category === 'FOOTWEAR') {
          next.footwearId = g.id;
        } else if (g.category === 'ACCESSORY' && !next.accessoryIds.includes(g.id)) {
          next.accessoryIds.push(g.id);
        }
      }
      return { selection: next, lastPreviewUrl: undefined, lastPreviewGarmentIds: [] };
    }),

  clearSelection: () =>
    set({
      selection: { accessoryIds: [] },
      lastPreviewUrl: undefined,
      lastPreviewGarmentIds: [],
    }),

  setPreview: (url, garmentIds) =>
    set({
      lastPreviewUrl: url,
      lastPreviewGarmentIds: garmentIds,
    }),

  clearPreview: () =>
    set({
      lastPreviewUrl: undefined,
      lastPreviewGarmentIds: [],
    }),
}));
