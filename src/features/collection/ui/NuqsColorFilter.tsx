'use client';

import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { useTransition, useState } from 'react';
import {
  Filter,
  FilterValue,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { Checkbox } from '@shared/ui/checkbox';
import { Spinner } from '@/shared/ui/Spinner';

type Props = {
  filter: Filter;
};

export const colorMap: { [key: string]: string } = {
  Бежевий: 'bg-[#F5F5DC]',
  Блакитний: 'bg-[#87CEEB]',
  Бордовий: 'bg-[#800000]',
  Бронзовий: 'bg-[#CD7F32]',
  Білий: 'bg-[#FFFFFF]',
  Жовтий: 'bg-[#FFFF00]',
  Зелений: 'bg-[#008000]',
  Золото: 'bg-[#FFD700]',
  Коричневий: 'bg-[#A52A2A]',
  "М'ятний": 'bg-[#98FF98]',
  Мультиколор: 'bg-gradient-to-r from-red-500 to-blue-500',
  Помаранчевий: 'bg-[#FFA500]',
  Пітон: 'bg-gray-500',
  Рожевий: 'bg-[#FFC0CB]',
  Рудий: 'bg-[#D2691E]',
  Синій: 'bg-[#0000FF]',
  Срібло: 'bg-[#C0C0C0]',
  Сірий: 'bg-[#808080]',
  Фіолетовий: 'bg-[#8A2BE2]',
  Хакі: 'bg-[#F0E68C]',
  Червоний: 'bg-[#FF0000]',
  Чорний: 'bg-[#000000]',
};

export function NuqsColorFilter({ filter }: Props) {
  const [isPending, startTransition] = useTransition();
  const [changingFilter, setChangingFilter] = useState<string | null>(null);
  const filterKey = filter.id.split('.').pop() || filter.id;

  const [selectedValues, setSelectedValues] = useQueryState(
    filterKey,
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false, history: 'replace' }),
  );

  const handleFilterChange = (value: FilterValue) => {
    setChangingFilter(value.label);
    startTransition(() => {
      const newSelection = selectedValues.includes(value.label)
        ? selectedValues.filter((item) => item !== value.label)
        : [...selectedValues, value.label];
      setSelectedValues(newSelection.length > 0 ? newSelection : null);
    });
  };

  return (
    <div className="flex flex-wrap gap-4">
      {[...filter.values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = selectedValues.includes(value.label);
          const isChanging = changingFilter === value.label;
          return (
            <label
              key={value.label}
              className={cn('flex items-center space-x-2 cursor-pointer', {
                'text-muted-foreground line-through': value.count === 0,
              })}
            >
              {isPending && isChanging ? (
                <Spinner />
              ) : (
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleFilterChange(value)}
                />
              )}
              <span
                className={cn(
                  'w-6 h-6 rounded-full border',
                  {
                    'border-gray-300': value.count > 0,
                    'border-muted': value.count === 0,
                  },
                  colorMap[value.label] || 'bg-gray-200',
                )}
              ></span>
              <span>
                {value.label} ({value.count})
              </span>
            </label>
          );
        })}
    </div>
  );
}
