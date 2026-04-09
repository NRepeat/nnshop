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
    disabled?: boolean;
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
      disabled={provider.disabled}
      onClick={() => {
        if (provider.disabled) return;
        setValue('paymentProvider', provider.id);
        onSelectPaymentProvider(provider.id);
      }}
      className={clsx(
        'group relative p-6 rounded border border-transparent h-fit w-full transition-all hover:shadow-md justify-start',
        {
          'border-gray-200 ': selectedProvider !== provider.id,
          'opacity-60 cursor-not-allowed': provider.disabled,
        },
      )}
    >
      <div className="flex items-center gap-4 w-full justify-start">
        <div
          className={clsx(
            'w-12 h-12 rounded flex items-center justify-center',
            {
              'bg-white/20': selectedProvider === provider.id && !provider.disabled,
              'bg-[#325039]/10': selectedProvider !== provider.id || provider.disabled,
            },
          )}
        >
          {React.cloneElement(provider.icon as React.ReactElement)}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h3
              className={clsx('font-semibold text-base', {
                'text-white': selectedProvider === provider.id && !provider.disabled,
                'text-gray-900': selectedProvider !== provider.id || provider.disabled,
              })}
            >
              {t(provider.id)}
            </h3>
            {provider.disabled && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {t('currentlyUnavailable')}
              </span>
            )}
          </div>
          <p
            className={clsx('text-sm', {
              'text-white/80': selectedProvider === provider.id && !provider.disabled,
              'text-gray-600': selectedProvider !== provider.id || provider.disabled,
            })}
          >
            {/* @ts-ignore */}
            {provider.id === 'liqpay' && t('liqpayDescription')}
            {/* @ts-ignore */}
            {provider.id === 'liqpay-payparts' && t('liqpay-paypartsDescription')}
            {/* @ts-ignore */}
            {provider.id === 'novapay' && t('novapayDescription')}
            {/* @ts-ignore */}
            {provider.id === 'credit-card' && t('creditCardDescription')}
            {/* @ts-ignore */}
            {provider.id === 'paypal' && t('paypalDescription')}
            {/*{provider.id === 'stripe' && t('stripeDescription')}*/}
          </p>
        </div>
      </div>
    </Button>
  );
}
