'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@shared/ui/form';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { SELF_PICKUP_POINTS } from '../lib/pickup-points';

export default function SelfPickupForm() {
  const { control } = useFormContext();
  const t = useTranslations('DeliveryForm');

  return (
    <div>
      <FormField
        control={control}
        name="selfPickupPoint"
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                {t('selfPickupChoosePoint')}
              </FormLabel>
              <p className="text-sm text-gray-600">
                {t('selfPickupDescription')}
              </p>
            </div>
            <FormControl>
              <div className="grid grid-cols-1 gap-3">
                {SELF_PICKUP_POINTS.map((point) => {
                  const isSelected = field.value === point.id;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => field.onChange(point.id)}
                      className={clsx(
                        'flex items-start gap-4 rounded border p-4 text-left transition-all hover:shadow-md',
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-gray-200 bg-white text-gray-900',
                      )}
                    >
                      <div
                        className={clsx(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          isSelected
                            ? 'border-background'
                            : 'border-gray-400',
                        )}
                      >
                        {isSelected && (
                          <div className="h-2.5 w-2.5 rounded-full bg-background" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{point.name}</p>
                        <p
                          className={clsx(
                            'text-sm',
                            isSelected ? 'text-background/80' : 'text-gray-500',
                          )}
                        >
                          {point.address}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage className="text-red-500 text-sm mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}
