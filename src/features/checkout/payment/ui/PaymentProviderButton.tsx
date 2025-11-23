'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { PaymentInfo } from '../schema/paymentSchema';

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
    <button
      key={provider.id}
      type="button"
      onClick={() => {
        setValue('paymentProvider', provider.id);
        onSelectPaymentProvider(provider.id);
      }}
      className={clsx(
        'group relative p-6 rounded-xl border-2 transition-all duration-200',
        {
          'border-[#325039] bg-[#325039] text-white shadow-lg':
            selectedProvider === provider.id,
          'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white':
            selectedProvider !== provider.id,
        },
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            {
              'bg-white/20': selectedProvider === provider.id,
              'bg-[#325039]/10': selectedProvider !== provider.id,
            },
          )}
        >
          {React.cloneElement(provider.icon as React.ReactElement, {
            className: clsx('w-6 h-6', {
              'text-white': selectedProvider === provider.id,
              'text-[#325039]': selectedProvider !== provider.id,
            }),
          })}
        </div>
        <div className="text-left">
          <h3
            className={clsx('font-semibold text-base', {
              'text-white': selectedProvider === provider.id,
              'text-gray-900': selectedProvider !== provider.id,
            })}
          >
            {t(provider.name)}
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
            {provider.id === 'stripe' && t('stripeDescription')}
          </p>
        </div>
      </div>
      {selectedProvider === provider.id && (
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
  );
}
