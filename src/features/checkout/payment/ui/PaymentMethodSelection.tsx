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
import clsx from 'clsx';
import { PaymentInfo } from '../schema/paymentSchema';

interface PaymentMethodSelectionProps {
  paymentMethods: {
    id: PaymentInfo['paymentMethod'];
    name: string;
    availableMethods: string[];
  }[];
  onSelectPaymentMethod: (method: PaymentInfo['paymentMethod']) => void;
}

export default function PaymentMethodSelection({
  paymentMethods,
  onSelectPaymentMethod,
}: PaymentMethodSelectionProps) {
  const { control, watch, setValue } = useFormContext();
  const t = useTranslations('PaymentForm');

  const selectedPaymentMethod = watch('paymentMethod');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <FormField
        control={control}
        name="paymentMethod"
        render={({ field }) => (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      field.onChange(method.id);
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
                            'bg-[#325039]/10':
                              selectedPaymentMethod !== method.id,
                          },
                        )}
                      >
                        {method.id === 'pay-now' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedPaymentMethod === method.id,
                              'text-[#325039]':
                                selectedPaymentMethod !== method.id,
                            })}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        )}
                        {method.id === 'after-delivered' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedPaymentMethod === method.id,
                              'text-[#325039]':
                                selectedPaymentMethod !== method.id,
                            })}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {method.id === 'pay-later' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedPaymentMethod === method.id,
                              'text-[#325039]':
                                selectedPaymentMethod !== method.id,
                            })}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        )}
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
                        {method.id === 'after-delivered' &&
                          t('afterDeliveredDescription')}
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
