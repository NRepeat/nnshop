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

export default function UkrPoshtaForm() {
  const form = useFormContext();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delivery Address
        </h3>
        <p className="text-sm text-gray-600">
          Please provide your complete delivery address for UkrPoshta.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                Country/Region
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter country/region"
                    {...field}
                    className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                      form.formState.isSubmitted &&
                      form.formState.errors.country
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'border-gray-200 focus:border-[#325039]'
                    }`}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter street address"
                      {...field}
                      className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                        form.formState.isSubmitted &&
                        form.formState.errors.address
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 focus:border-[#325039]'
                      }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Apartment
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter apartment number"
                      {...field}
                      className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                        form.formState.isSubmitted &&
                        form.formState.errors.apartment
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 focus:border-[#325039]'
                      }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  City
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter city"
                      {...field}
                      className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                        form.formState.isSubmitted && form.formState.errors.city
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 focus:border-[#325039]'
                      }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Postal Code
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter postal code"
                      {...field}
                      className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-[#325039]/20 ${
                        form.formState.isSubmitted &&
                        form.formState.errors.postalCode
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 focus:border-[#325039]'
                      }`}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
