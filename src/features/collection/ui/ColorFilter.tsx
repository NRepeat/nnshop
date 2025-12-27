'use client';

import { cn } from '@/shared/lib/utils';
import { FilterValue } from '@shared/lib/shopify/types/storefront.types';
import { Spinner } from '@/shared/ui/Spinner';

type ActiveFiltersState = {
  [key: string]: string[] | string;
};

type ColorFilterProps = {
  values: FilterValue[];
  activeFilters: ActiveFiltersState;
  onFilterChange: (value: FilterValue) => void;
  isPending: boolean;
  changingFilter: string | null;
};

const colorMap: { [key: string]: string } = {
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
  Пітон: 'bg-gray-500', // Placeholder
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

const getFilterParamName = (filterId: string) => {
  if (filterId.startsWith('filter.p.m.custom')) {
    return filterId.split('.').pop() || '';
  }
  return '';
};

export const ColorFilter = ({
  values,
  activeFilters,
  onFilterChange,
  isPending,
  changingFilter,
}: ColorFilterProps) => {
  const colorFilterParamName = getFilterParamName('filter.p.m.custom.color');

  return (
    <div className="flex flex-wrap gap-4">
      {[...values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => {
          const isChecked = (
            activeFilters[colorFilterParamName] as string[]
          )?.includes(value.label);
          const isChanging = changingFilter === value.label;
          return (
            <label
              key={value.label}
              className="flex items-center space-x-2 cursor-pointer"
            >
              {isPending && isChanging ? (
                <Spinner />
              ) : (
                <input
                  type="checkbox"
                  className="rounded"
                  checked={!!isChecked}
                  onChange={() => onFilterChange(value)}
                  disabled={isPending}
                />
              )}
              <span
                className={cn(
                  'w-6 h-6 rounded-full border border-gray-300',
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
};
