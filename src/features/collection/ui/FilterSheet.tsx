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
        <Button variant="outline" className="w-full shadow-none border">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {t('showFilters')}
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-5">
        <SheetHeader className="w-full  flex justify-center items-center py-5 border-b border-b-muted">
          <SheetTitle className="text-base font-400">
            {t('filters.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-auto px-5 overflow-y-scroll">
          <CollectionFilters filters={filters} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
