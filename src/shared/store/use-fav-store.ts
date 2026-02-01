import { create } from 'zustand';

interface FavState {
  favState: Record<string, string> | null;
  setFavState: (paths: Record<string, string> | null) => void;
}

export const usePathStore = create<FavState>((set) => ({
  favState: null,
  setFavState: (fav) => set({ favState: fav }),
}));
