import { create } from 'zustand';

interface UiStoreState {
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
}));
