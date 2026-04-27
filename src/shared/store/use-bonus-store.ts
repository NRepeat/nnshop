import { create } from 'zustand';

interface BonusStore {
  bonusSpend: number;
  setBonusSpend: (amount: number) => void;
}

export const useBonusStore = create<BonusStore>((set) => ({
  bonusSpend: 0,
  setBonusSpend: (amount) => set({ bonusSpend: amount }),
}));
