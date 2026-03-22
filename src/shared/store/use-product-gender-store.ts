'use client';

import { create } from 'zustand';

type ProductGender = 'man' | 'woman' | 'unisex' | null;

interface ProductGenderState {
  productGender: ProductGender;
  setProductGender: (gender: ProductGender) => void;
}

export const useProductGenderStore = create<ProductGenderState>((set) => ({
  productGender: null,
  setProductGender: (productGender) => set({ productGender }),
}));
