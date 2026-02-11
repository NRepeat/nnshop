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
import { PaymentInfo } from '../schema/paymentSchema';
import PaymentMethodButton from './PaymentMethodButton';
import clsx from 'clsx';

interface PaymentMethodSelectionProps {
  paymentMethods: {
    id: PaymentInfo['paymentMethod'];
    name: string;
    availableMethods: string[];
    icon: React.ReactNode;
  }[];
  onSelectPaymentMethod: (method: PaymentInfo['paymentMethod']) => void;
}

export default function PaymentMethodSelection({
  paymentMethods,
  onSelectPaymentMethod,
}: PaymentMethodSelectionProps) {
  const { control } = useFormContext();
  const t = useTranslations('PaymentForm');

  return (
    <div className="">
      <FormField
        control={control}
        name="paymentMethod"
        render={() => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                {t('choosePaymentMethod')}
              </FormLabel>
              <p className="text-sm text-gray-600">
                {t('selectPaymentMethodDescription')}
              </p>
            </div>
            <FormControl>
              <div className="flex flex-col gap-3">
                {paymentMethods.map((method) => (
                  <PaymentMethodButton
                    key={method.id}
                    method={method}
                    onSelectPaymentMethod={onSelectPaymentMethod}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-red-500 text-sm absolute -bottom-6 min-h-5" />
          </FormItem>
        )}
      />
    </div>
  );
}
