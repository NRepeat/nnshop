'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { Button } from '@shared/ui/button';
import { CollectionFilters } from './CollectionFilters';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { Filter } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  filters: Filter[];
};

export function FilterSheet({ filters }: Props) {
  const t = useTranslations('CollectionPage');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {t('showFilters')}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('filters.title')}</SheetTitle>
        </SheetHeader>
        <div className="overflow-auto">
          <CollectionFilters filters={filters} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
