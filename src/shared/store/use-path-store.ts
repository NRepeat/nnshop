import { create } from 'zustand';

interface PathState {
  alternatePaths: Record<string, string> | null;
  setAlternatePaths: (paths: Record<string, string> | null) => void;
}

export const usePathStore = create<PathState>((set) => ({
  alternatePaths: null,
  setAlternatePaths: (paths) => set({ alternatePaths: paths }),
}));
