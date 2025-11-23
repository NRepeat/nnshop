'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { PaymentInfo } from '../schema/paymentSchema';

interface PaymentMethodButtonProps {
  method: {
    id: PaymentInfo['paymentMethod'];
    name: string;
    icon: React.ReactNode;
  };
  onSelectPaymentMethod: (method: PaymentInfo['paymentMethod']) => void;
}

export default function PaymentMethodButton({
  method,
  onSelectPaymentMethod,
}: PaymentMethodButtonProps) {
  const { watch, setValue } = useFormContext();
  const t = useTranslations('PaymentForm');
  const selectedPaymentMethod = watch('paymentMethod');

  return (
    <button
      key={method.id}
      type="button"
      onClick={() => {
        setValue('paymentMethod', method.id);
        onSelectPaymentMethod(method.id);
        // Reset paymentProvider when paymentMethod changes
        setValue('paymentProvider', 'liqpay'); // Default to liqpay or first available
      }}
      className={clsx(
        'group relative p-6 rounded-xl border-2 transition-all duration-200',
        {
          'border-[#325039] bg-[#325039] text-white shadow-lg':
            selectedPaymentMethod === method.id,
          'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white':
            selectedPaymentMethod !== method.id,
        },
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
            {
              'bg-white/20': selectedPaymentMethod === method.id,
              'bg-[#325039]/10': selectedPaymentMethod !== method.id,
            },
          )}
        >
          {React.cloneElement(method.icon as React.ReactElement, {
            className: clsx('w-6 h-6', {
              'text-white': selectedPaymentMethod === method.id,
              'text-[#325039]': selectedPaymentMethod !== method.id,
            }),
          })}
        </div>
        <h3
          className={clsx('font-semibold text-base', {
            'text-white': selectedPaymentMethod === method.id,
            'text-gray-900': selectedPaymentMethod !== method.id,
          })}
        >
          {t(method.name)}
        </h3>
        <p
          className={clsx('text-sm mt-1', {
            'text-white/80': selectedPaymentMethod === method.id,
            'text-gray-600': selectedPaymentMethod !== method.id,
          })}
        >
          {method.id === 'pay-now' && t('payNowDescription')}
          {method.id === 'after-delivered' && t('afterDeliveredDescription')}
          {method.id === 'pay-later' && t('payLaterDescription')}
        </p>
      </div>
      {selectedPaymentMethod === method.id && (
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
