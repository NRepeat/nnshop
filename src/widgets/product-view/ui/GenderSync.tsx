'use client';

import { useEffect } from 'react';
import { useProductGenderStore } from '@shared/store/use-product-gender-store';

type ProductGender = 'man' | 'woman' | 'unisex' | null;

export function GenderSync({ gender }: { gender: ProductGender }) {
  const setProductGender = useProductGenderStore((s) => s.setProductGender);

  useEffect(() => {
    setProductGender(gender);
    return () => setProductGender(null);
  }, [gender, setProductGender]);

  return null;
}
