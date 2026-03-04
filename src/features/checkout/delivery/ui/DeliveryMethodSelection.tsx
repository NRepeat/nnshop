'use client';

import React from 'react';
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
import { Button } from '@shared/ui/button';

const deliveryMethods = [
  {
    id: 'novaPoshta',
    name: 'novaPoshta',
    delivery: 'novaPoshtaDelivery',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{
          width: '24px',
          height: '24px',
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    id: 'selfPickup',
    name: 'selfPickup',
    delivery: 'selfPickupDelivery',
    icon: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{
          width: '24px',
          height: '24px',
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
];

export default function DeliveryMethodSelection() {
  const { control } = useFormContext();
  const t = useTranslations('DeliveryForm');

  return (
    <div className="">
      <FormField
        control={control}
        name="deliveryMethod"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                {t('chooseDeliveryMethod')}
              </FormLabel>
              <p className="text-sm text-gray-600">
                {t('deliveryPreferencesDescription')}
              </p>
            </div>
            <FormControl>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                {deliveryMethods.map((method) => (
                  <Button
                    type="button"
                    key={method.id}
                    variant={field.value !== method.id ? 'outline' : 'default'}
                    onClick={() => field.onChange(method.id)}
                    className={clsx(
                      'group relative rounded shadow-none h-fit border border-transparent transition-all hover:shadow-md',
                      {
                        'border border-gray-200': field.value !== method.id,
                      },
                    )}
                  >
                    <div className="flex  gap-4 justify-start w-full py-2">
                      <div
                        className={clsx(
                          'flex items-center justify-center w-12 h-12',
                        )}
                      >
                        {React.cloneElement(method.icon)}
                      </div>
                      <div className="text-left">
                        <h3 className={clsx('font-semibold text-base')}>
                          {t(method.name)}
                        </h3>
                        <p className={clsx('text-sm text-wrap')}>
                          {t(method.delivery)}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-red-500 text-sm mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}
