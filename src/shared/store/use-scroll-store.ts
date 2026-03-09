import { create } from 'zustand';

interface ScrollState {
  isHeaderVisible: boolean;
  isScrollHideEnabled: boolean;
  setHeaderVisible: (visible: boolean) => void;
  setScrollHideEnabled: (enabled: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  isHeaderVisible: true,
  isScrollHideEnabled: false,
  setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),
  setScrollHideEnabled: (enabled) => set({ isScrollHideEnabled: enabled }),
}));
