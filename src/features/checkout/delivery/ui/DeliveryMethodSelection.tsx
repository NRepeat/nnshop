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

export default function DeliveryMethodSelection() {
  const { control } = useFormContext();
  const t = useTranslations('DeliveryForm');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange('novaPoshta')}
                  className={clsx(
                    'group relative p-6 rounded-xl border-2 transition-all duration-200',
                    {
                      'border-[#325039] bg-[#325039] text-white shadow-lg':
                        field.value === 'novaPoshta',
                      'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white':
                        field.value !== 'novaPoshta',
                    },
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        {
                          'bg-white/20': field.value === 'novaPoshta',
                          'bg-[#325039]/10': field.value !== 'novaPoshta',
                        },
                      )}
                    >
                      <svg
                        className={clsx('w-6 h-6', {
                          'text-white': field.value === 'novaPoshta',
                          'text-[#325039]': field.value !== 'novaPoshta',
                        })}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3
                        className={clsx('font-semibold text-base', {
                          'text-white': field.value === 'novaPoshta',
                          'text-gray-900': field.value !== 'novaPoshta',
                        })}
                      >
                        {t('novaPoshta')}
                      </h3>
                      <p
                        className={clsx('text-sm', {
                          'text-white/80': field.value === 'novaPoshta',
                          'text-gray-600': field.value !== 'novaPoshta',
                        })}
                      >
                        {t('novaPoshtaDelivery')}
                      </p>
                    </div>
                  </div>
                  {field.value === 'novaPoshta' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#325039]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => field.onChange('ukrPoshta')}
                  className={clsx(
                    'group relative p-6 rounded-xl border-2 transition-all duration-200',
                    {
                      'border-[#325039] bg-[#325039] text-white shadow-lg':
                        field.value === 'ukrPoshta',
                      'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white':
                        field.value !== 'ukrPoshta',
                    },
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        {
                          'bg-white/20': field.value === 'ukrPoshta',
                          'bg-[#325039]/10': field.value !== 'ukrPoshta',
                        },
                      )}
                    >
                      <svg
                        className={clsx('w-6 h-6', {
                          'text-white': field.value === 'ukrPoshta',
                          'text-[#325039]': field.value !== 'ukrPoshta',
                        })}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3
                        className={clsx('font-semibold text-base', {
                          'text-white': field.value === 'ukrPoshta',
                          'text-gray-900': field.value !== 'ukrPoshta',
                        })}
                      >
                        {t('ukrPoshta')}
                      </h3>
                      <p
                        className={clsx('text-sm', {
                          'text-white/80': field.value === 'ukrPoshta',
                          'text-gray-600': field.value !== 'ukrPoshta',
                        })}
                      >
                        {t('ukrPoshtaDelivery')}
                      </p>
                    </div>
                  </div>
                  {field.value === 'ukrPoshta' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#325039]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </FormControl>
            <FormMessage className="text-red-500 text-sm mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}
