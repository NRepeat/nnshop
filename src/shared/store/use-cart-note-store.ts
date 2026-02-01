import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartNoteState {
  note: string;
  setNote: (note: string) => void;
  clearNote: () => void;
}

export const useCartNoteStore = create<CartNoteState>()(
  persist(
    (set) => ({
      note: '',
      setNote: (note) => set({ note }),
      clearNote: () => set({ note: '' }),
    }),
    {
      name: 'cart-note-storage',
    }
  )
);
