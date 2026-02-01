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
import { Input } from '@shared/ui/input';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

const addressFields = [
  { name: 'address', label: 'address', placeholder: 'enterStreetAddress' },
  {
    name: 'apartment',
    label: 'apartment',
    placeholder: 'enterApartmentNumber',
  },
];

const locationFields = [
  { name: 'city', label: 'city', placeholder: 'enterCity' },
  { name: 'postalCode', label: 'postalCode', placeholder: 'enterPostalCode' },
];

export default function UkrPoshtaForm() {
  const form = useFormContext();
  const t = useTranslations('DeliveryForm');

  return (
    <div className=" border border-gray-200 p-6 ">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('deliveryAddress')}
        </h3>
        <p className="text-sm text-gray-600">{t('ukrPoshtaDescription')}</p>
      </div>

      <div className="space-y-8">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="w-full relative">
              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                {t('countryRegion')}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder={t('enterCountryRegion')}
                    {...field}
                    className={clsx(
                      'h-12 px-4 rounded-md border transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                      form.formState.isSubmitted &&
                        form.formState.errors.country
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'border-gray-200 focus:border-black',
                    )}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          {addressFields.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name as any}
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    {t(item.label)}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(item.placeholder)}
                        {...field}
                        className={clsx(
                          'h-12 px-4 rounded-md border transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                          form.formState.isSubmitted &&
                            form.formState.errors[item.name]
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : 'border-gray-200 focus:border-black',
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          {locationFields.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name as any}
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    {t(item.label)}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={t(item.placeholder)}
                        {...field}
                        className={clsx(
                          'h-12 px-4 rounded-md border transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                          form.formState.isSubmitted &&
                            form.formState.errors[item.name]
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : 'border-gray-200 focus:border-[#325039]',
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
