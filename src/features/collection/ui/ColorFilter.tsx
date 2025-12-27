'use client';

import { cn } from '@/shared/lib/utils';
import {
  FilterValue,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';

type ColorFilterProps = {
  values: FilterValue[];
  activeFilters: ProductFilter[];
  onFilterChange: (filterInput: string, type: string) => void;
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

export const ColorFilter = ({
  values,
  activeFilters,
  onFilterChange,
}: ColorFilterProps) => {
  return (
    <div className="flex flex-col gap-4">
      {[...values]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((value) => (
          <label
            key={value.label}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="rounded"
              checked={activeFilters.some(
                (f) => JSON.stringify(f) === value.input,
              )}
              onChange={() => onFilterChange(value.input as string, 'LIST')}
            />
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
        ))}
    </div>
  );
};
