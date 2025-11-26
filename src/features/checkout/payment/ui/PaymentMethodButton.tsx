'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { PaymentInfo } from '../schema/paymentSchema';
import { Button } from '@shared/ui/button';

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
    <Button
      key={method.id}
      type="button"
      variant={selectedPaymentMethod !== method.id ? 'outline' : 'default'}
      onClick={() => {
        setValue('paymentMethod', method.id);
        onSelectPaymentMethod(method.id);
        setValue('paymentProvider', 'liqpay');
      }}
      className={clsx(
        'group relative p-6 rounded-none border border-transparent h-fit w-full',
        {
          'border-gray-200 ': selectedPaymentMethod !== method.id,
        },
      )}
    >
      <div className="flex flex-col items-center text-center px-2 w-fit text-pretty">
        <div
          className={clsx(
            'w-12 h-12 rounded-none flex items-center justify-center mb-3',
            {
              'bg-white/20': selectedPaymentMethod === method.id,
              'bg-[#325039]/10': selectedPaymentMethod !== method.id,
            },
          )}
        >
          {React.cloneElement(method.icon as React.ReactElement, {})}
        </div>
        <h3
          className={clsx('font-semibold text-base', {
            'text-white': selectedPaymentMethod === method.id,
            'text-gray-900': selectedPaymentMethod !== method.id,
          })}
        >
          {t(method.id.toString().trim().toLowerCase())}
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
    </Button>
  );
}
