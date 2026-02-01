'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { PaymentInfo } from '../schema/paymentSchema';
import { Button } from '@shared/ui/button';

interface PaymentProviderButtonProps {
  provider: {
    id: PaymentInfo['paymentProvider'];
    name: string;
    icon: React.ReactNode;
  };
  onSelectPaymentProvider: (provider: PaymentInfo['paymentProvider']) => void;
}

export default function PaymentProviderButton({
  provider,
  onSelectPaymentProvider,
}: PaymentProviderButtonProps) {
  const { watch, setValue } = useFormContext();
  const t = useTranslations('PaymentForm');
  const selectedProvider = watch('paymentProvider');

  return (
    <Button
      key={provider.id}
      type="button"
      variant={selectedProvider !== provider.id ? 'outline' : 'default'}
      onClick={() => {
        setValue('paymentProvider', provider.id);
        onSelectPaymentProvider(provider.id);
      }}
      className={clsx(
        'group relative p-6 rounded-md border border-transparent h-fit w-full transition-all hover:shadow-md',
        {
          'border-gray-200 ': selectedProvider !== provider.id,
        },
      )}
    >
      <div className="flex items-center  gap-4">
        <div
          className={clsx(
            'w-12 h-12 rounded-md flex items-center justify-center',
            {
              'bg-white/20': selectedProvider === provider.id,
              'bg-[#325039]/10': selectedProvider !== provider.id,
            },
          )}
        >
          {React.cloneElement(provider.icon as React.ReactElement)}
        </div>
        <div className="text-left">
          <h3
            className={clsx('font-semibold text-base', {
              'text-white': selectedProvider === provider.id,
              'text-gray-900': selectedProvider !== provider.id,
            })}
          >
            {t(provider.id)}
          </h3>
          <p
            className={clsx('text-sm', {
              'text-white/80': selectedProvider === provider.id,
              'text-gray-600': selectedProvider !== provider.id,
            })}
          >
            {provider.id === 'liqpay' && t('liqpayDescription')}
            {provider.id === 'credit-card' && t('creditCardDescription')}
            {provider.id === 'paypal' && t('paypalDescription')}
            {/*{provider.id === 'stripe' && t('stripeDescription')}*/}
          </p>
        </div>
      </div>
    </Button>
  );
}
