import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import LandingPage from '@/features/auth/pages/LandingPage';
import { useOutfitStudioStore } from '@/store/outfit-studio.store';
import { SEED_GARMENTS } from '@/mocks/seed';
import { resetMockDbForDemoUser } from '@/mocks/mock-db';
import { wardrobeService } from '@/services/wardrobe.service';
import { outfitService } from '@/services/outfit.service';

describe('Wardrobe AI key frontend flows', () => {
  beforeEach(() => {
    resetMockDbForDemoUser();
    useOutfitStudioStore.getState().clearSelection();
  });

  it('renders the landing page with hero headline and primary CTA', () => {
    render(
      <AppProviders>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('Your wardrobe. Reimagined.')).toBeInTheDocument();
    expect(screen.getAllByText('Create your wardrobe').length).toBeGreaterThan(0);
  });

  it('manages Outfit Studio slot rules cleanly (one-piece replaces top + bottom)', () => {
    const store = useOutfitStudioStore.getState();
    const top = SEED_GARMENTS.find((g) => g.category === 'TOP')!;
    const bottom = SEED_GARMENTS.find((g) => g.category === 'BOTTOM')!;
    const onePiece = SEED_GARMENTS.find((g) => g.category === 'ONE_PIECE')!;
    const shoes = SEED_GARMENTS.find((g) => g.category === 'FOOTWEAR')!;

    store.selectGarment(top);
    store.selectGarment(bottom);
    store.selectGarment(shoes);

    expect(useOutfitStudioStore.getState().selection.topId).toBe(top.id);
    expect(useOutfitStudioStore.getState().selection.bottomId).toBe(bottom.id);
    expect(useOutfitStudioStore.getState().selection.footwearId).toBe(shoes.id);

    // Selecting one-piece clears top & bottom
    useOutfitStudioStore.getState().selectGarment(onePiece);
    expect(useOutfitStudioStore.getState().selection.onePieceId).toBe(onePiece.id);
    expect(useOutfitStudioStore.getState().selection.topId).toBeUndefined();
    expect(useOutfitStudioStore.getState().selection.bottomId).toBeUndefined();
  });

  it('toggles garment favorites and simulates outfit try-on credit deduction via services', async () => {
    const items = await wardrobeService.listItems();
    expect(items.length).toBeGreaterThan(15);

    const first = items[0];
    const toggled = await wardrobeService.toggleFavorite(first.id);
    expect(toggled.favorite).toBe(!first.favorite);

    const result = await outfitService.generateTryOn({
      avatarId: 'avt_01',
      topId: 'grm_01',
      bottomId: 'grm_06',
      footwearId: 'grm_14',
      accessoryIds: ['grm_19'],
    });
    expect(result.previewUrl).toContain('data:image/svg+xml');
    expect(result.creditsCharged).toBe(1);
  });
});
