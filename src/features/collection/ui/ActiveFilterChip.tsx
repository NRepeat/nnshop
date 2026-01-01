'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition } from 'react';
import { Button } from '@shared/ui/button';
import { X } from 'lucide-react';

type Props = {
  filterKey: string;
  filterValue: string;
};

export function ActiveFilterChip({ filterKey, filterValue }: Props) {
  const [isPending, startTransition] = useTransition();

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false, startTransition }),
  );

  const removeFilter = () => {
    const newSelection = selectedValues.filter((item) => item !== filterValue);
    setSelectedValues(newSelection.length > 0 ? newSelection : null);
  };

  return (
    <div className="flex items-center justify-center gap-1 rounded-full border border-muted-foreground px-4 py-1 basis-auto">
      <span className="text-sm font-medium">{filterValue}</span>
      <Button
        variant={'link'}
        onClick={removeFilter}
        disabled={isPending}
        className="bg-background hover:bg-background h-auto p-1"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
