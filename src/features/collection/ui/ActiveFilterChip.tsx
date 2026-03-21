'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition } from 'react';
import { Button } from '@shared/ui/button';
import { X } from 'lucide-react';
import { Filter } from '@shared/lib/shopify/types/storefront.types';

type Props = {
  filterKey: string;
  filterValue: string;
  label: string;
  filter?: Filter | undefined;
};

export function ActiveFilterChip({
  filterKey,
  filterValue,
  label,
  filter,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString, ';')
      .withDefault([])
      .withOptions({ shallow: false, startTransition }),
  );

  const removeFilter = () => {
    const newSelection = selectedValues.filter((item) => item !== filterValue);
    setSelectedValues(newSelection.length > 0 ? newSelection : null);
  };
  let currentFilterLabel = label;
  if (filter?.id === 'filter.p.m.custom.rozmir') {
    currentFilterLabel = currentFilterLabel.toUpperCase();
  }
  return (
    <div className="flex items-center justify-center gap-1 rounded-full border border-muted-foreground pl-3 py-1 basis-auto">
      <span className="text-sm font-medium">{currentFilterLabel}</span>
      <Button
        variant={'link'}
        size={'icon'}
        onClick={() => {
          removeFilter();
        }}
        disabled={isPending}
        className="bg-transparent h-auto p-1 hover:bg-transparent [&>svg]:size-4"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
