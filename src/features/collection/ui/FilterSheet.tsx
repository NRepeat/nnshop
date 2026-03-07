'use client';

import {
  Sheet,
  SheetClose,
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
  hideVendor?: boolean;
};

export function FilterSheet({ filters, initialFilters, hideVendor }: Props) {
  const t = useTranslations('CollectionPage');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="   rounded flex flex-row items-center justify-center "
        >
          <p>
            <span className="whitespace-nowrap transform mb-2">
              {t('showFilters')}
            </span>
          </p>
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 w-full md:min-w-[450px] flex flex-col p-0">
        <SheetHeader className="w-full flex justify-center items-center py-5 border-b border-b-muted px-5">
          <SheetTitle className="text-base font-400">
            {t('filters.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filters && (
            <CollectionFilters
              filters={filters}
              initialFilters={initialFilters}
              hideVendor={hideVendor}
            />
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t border-muted px-5 py-4">
          <SheetClose asChild>
            <Button className="w-full" size="lg">
              {t('filters.apply')}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
