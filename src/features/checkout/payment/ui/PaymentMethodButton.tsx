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
  const isSelected = selectedPaymentMethod === method.id;

  return (
    <button
      type="button"
      onClick={() => {
        setValue('paymentMethod', method.id);
        onSelectPaymentMethod(method.id);
      }}
      className={clsx(
        'flex items-center gap-4 w-full p-4 rounded-md border transition-all text-left',
        {
          'border-primary bg-primary/5': isSelected,
          'border-gray-200 hover:border-gray-300': !isSelected,
        },
      )}
    >
      <div
        className={clsx(
          'w-10 h-10 rounded-md flex items-center justify-center shrink-0',
          {
            'bg-primary/10': isSelected,
            'bg-gray-100': !isSelected,
          },
        )}
      >
        {React.cloneElement(method.icon as React.ReactElement<any>, {
          className: clsx('w-5 h-5', {
            'text-primary': isSelected,
            'text-gray-600': !isSelected,
          }),
        })}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={clsx('font-medium text-sm', {
            'text-primary': isSelected,
            'text-gray-900': !isSelected,
          })}
        >
          {t(method.id.toString().trim().toLowerCase())}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {method.id === 'pay-now' && t('payNowDescription')}
          {method.id === 'after-delivered' && t('afterDeliveredDescription')}
          {method.id === 'pay-later' && t('payLaterDescription')}
        </p>
        {method.id === 'after-delivered' && (
          <p className="text-xs text-gray-400 mt-0.5">
            {t('afterDeliveredNote')}
          </p>
        )}
      </div>
      <div
        className={clsx(
          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center',
          {
            'border-primary': isSelected,
            'border-gray-300': !isSelected,
          },
        )}
      >
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}
