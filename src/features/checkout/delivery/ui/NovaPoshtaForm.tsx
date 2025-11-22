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
import { NovaPoshtaButton } from '@features/novaPoshta';

export default function NovaPoshtaForm({
  handleDepartmentSelect,
}: {
  handleDepartmentSelect: (department: any) => void;
}) {
  const { control, setValue, watch } = useFormContext();
  const novaPoshtaDepartment = watch('novaPoshtaDepartment');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <FormField
        control={control}
        name="novaPoshtaDepartment"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                Select Nova Poshta Department
              </FormLabel>
              <p className="text-sm text-gray-600">
                Choose the most convenient Nova Poshta branch or parcel locker
                for your delivery.
              </p>
            </div>
            <FormControl>
              <div className="relative">
                <NovaPoshtaButton
                  onDepartmentSelect={handleDepartmentSelect}
                  className="w-full"
                  initialText={field.value?.shortName || ''}
                  initialDescription={
                    field.value?.addressParts
                      ? `${field.value.addressParts.city || ''} вул. ${
                          field.value.addressParts.street || ''
                        }, ${field.value.addressParts.building || ''}`
                      : 'Обрати відділення або поштомат'
                  }
                />
              </div>
            </FormControl>
            <FormMessage className="text-red-500 text-sm mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}
