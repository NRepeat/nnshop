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
import { Filter } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  filters: Filter[] | undefined;
  initialFilters: Filter[] | undefined;
};

export function FilterSheet({ filters, initialFilters }: Props) {
  const t = useTranslations('CollectionPage');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="link"
          className="   flex flex-row items-center justify-center "
        >
          <p>
            <span className="whitespace-nowrap transform mb-2">
              {t('showFilters')}
            </span>
          </p>
        </Button>
      </SheetTrigger>
      <SheetContent  className="gap-5 w-full  md:min-w-[450px]">
        <SheetHeader className="w-full  flex justify-center items-center py-5 border-b border-b-muted">
          <SheetTitle className="text-base font-400">
            {t('filters.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-auto px-5 overflow-y-scroll">
          {filters && (
            <CollectionFilters
              filters={filters}
              initialFilters={initialFilters}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
