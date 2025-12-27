'use server';

import { FilterValue } from '@shared/lib/shopify/types/storefront.types';
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

const getFilterParamName = (filterId: string) => {
  if (filterId.startsWith('filter.p.vendor')) {
    return 'vendor';
  }
  if (filterId.startsWith('filter.p.m.custom')) {
    return filterId.split('.').pop() || '';
  }
  return '';
};

export async function createFilterUrl(
  currentSearchParams: string,
  pathname: string,
  filterId: string,
  filterValue: FilterValue,
) {
  const filterParamName = getFilterParamName(filterId);
  if (!filterParamName) {
    return `${pathname}?${currentSearchParams}`;
  }

  const valueToPutInUrl = filterValue.label;

  const newSearchParams = new URLSearchParams(currentSearchParams);
  const currentParam = newSearchParams.get(filterParamName);
  let newValues: string[] = [];

  if (currentParam) {
    newValues = currentParam.split(',');
  }

  const existingIndex = newValues.indexOf(valueToPutInUrl);

  if (existingIndex > -1) {
    newValues.splice(existingIndex, 1);
  } else {
    newValues.push(valueToPutInUrl);
  }

  if (newValues.length > 0) {
    newSearchParams.set(filterParamName, newValues.join(','));
  } else {
    newSearchParams.delete(filterParamName);
  }
  revalidateTag('collection', { expire: 0 });
  return redirect(`${pathname}?${newSearchParams.toString()}`);
}

export async function createPriceUrl(
  currentSearchParams: string,
  pathname: string,
  min: string,
  max: string,
) {
  const newSearchParams = new URLSearchParams(currentSearchParams);
  if (min) {
    newSearchParams.set('minPrice', min);
  } else {
    newSearchParams.delete('minPrice');
  }
  if (max) {
    newSearchParams.set('maxPrice', max);
  } else {
    newSearchParams.delete('maxPrice');
  }
  return `${pathname}?${newSearchParams.toString()}`;
}
