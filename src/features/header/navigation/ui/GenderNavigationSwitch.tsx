'use client';

import { usePathname } from 'next/navigation';
import { useProductGenderStore } from '@shared/store/use-product-gender-store';
import { genders } from '@shared/i18n/routing';
import { DEFAULT_GENDER } from '@shared/config/shop';

export function GenderNavigationSwitch({
  womanNav,
  manNav,
}: {
  womanNav: React.ReactNode;
  manNav: React.ReactNode;
}) {
  const pathname = usePathname();
  const productGender = useProductGenderStore((s) => s.productGender);

  const segments = pathname.split('/').filter(Boolean);
  const genderInUrl = segments.find((s) => genders.includes(s));

  // On product pages, use product's gender from store; otherwise use URL
  const isProductPage = segments.includes('product');
  const resolvedGender =
    isProductPage && productGender && productGender !== 'unisex'
      ? productGender
      : genderInUrl ?? DEFAULT_GENDER;

  return resolvedGender === 'man' ? (
    <>{manNav}</>
  ) : (
    <>{womanNav}</>
  );
}
