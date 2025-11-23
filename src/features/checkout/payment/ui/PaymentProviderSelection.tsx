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
import PaymentProviderButton from './PaymentProviderButton';

interface PaymentProviderSelectionProps {
  paymentProviders: {
    id: PaymentInfo['paymentProvider'];
    name: string;
    icon: React.ReactNode;
  }[];
  onSelectPaymentProvider: (provider: PaymentInfo['paymentProvider']) => void;
}

export default function PaymentProviderSelection({
  paymentProviders,
  onSelectPaymentProvider,
}: PaymentProviderSelectionProps) {
  const { control } = useFormContext();
  const t = useTranslations('PaymentForm');

  return (
    <div className="">
      <FormField
        control={control}
        name="paymentProvider"
        render={() => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                {t('choosePaymentProvider')}
              </FormLabel>
              <p className="text-sm text-gray-600">
                {t('selectPaymentProviderDescription')}
              </p>
            </div>
            <FormControl>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paymentProviders.map((provider) => (
                  <PaymentProviderButton
                    key={provider.id}
                    provider={provider}
                    onSelectPaymentProvider={onSelectPaymentProvider}
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
