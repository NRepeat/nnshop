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
    <div className="flex items-center justify-center gap-1 rounded-full border border-muted-foreground pl-3 py-1 basis-auto">
      <span className="text-sm font-medium">{decodeURIComponent(filterValue)}</span>
      <Button
        variant={'link'}
        size={'icon'}
        onClick={removeFilter}
        disabled={isPending}
        className="bg-transparent h-auto p-1 hover:bg-transparent [&>svg]:size-4"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
