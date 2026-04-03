'use client';

import { useEffect, useRef } from 'react';
import { useProductGenderStore } from '@shared/store/use-product-gender-store';

type ProductGender = 'man' | 'woman' | 'unisex' | null;

export function GenderSync({ gender }: { gender: ProductGender }) {
  const setProductGender = useProductGenderStore((s) => s.setProductGender);
  const initialized = useRef(false);

  // Set immediately on first render to avoid flash
  if (!initialized.current) {
    initialized.current = true;
    setProductGender(gender);
  }

  useEffect(() => {
    setProductGender(gender);
    return () => setProductGender(null);
  }, [gender, setProductGender]);

  return null;
}
