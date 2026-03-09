import { create } from 'zustand';

type GridCols = '2' | '3';

interface GridState {
  cols: GridCols;
  setCols: (cols: GridCols) => void;
}

export const useGridStore = create<GridState>((set) => ({
  cols: '2',
  setCols: (cols) => set({ cols }),
}));
