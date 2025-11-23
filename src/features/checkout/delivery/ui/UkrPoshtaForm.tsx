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

export default function UkrPoshtaForm() {
  const form = useFormContext();
  const t = useTranslations('DeliveryForm');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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
                      'h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                      form.formState.isSubmitted &&
                        form.formState.errors.country
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('address')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('enterStreetAddress')}
                      {...field}
                      className={clsx(
                        'h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                        form.formState.isSubmitted &&
                          form.formState.errors.address
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

          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('apartment')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('enterApartmentNumber')}
                      {...field}
                      className={clsx(
                        'h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                        form.formState.isSubmitted &&
                          form.formState.errors.apartment
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('city')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('enterCity')}
                      {...field}
                      className={clsx(
                        'h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                        form.formState.isSubmitted && form.formState.errors.city
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

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('postalCode')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('enterPostalCode')}
                      {...field}
                      className={clsx(
                        'h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20',
                        form.formState.isSubmitted &&
                          form.formState.errors.postalCode
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
        </div>
      </div>
    </div>
  );
}
