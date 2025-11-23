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

interface PaymentProviderSelectionProps {
  paymentProviders: {
    id: PaymentInfo['paymentProvider'];
    name: string;
  }[];
  onSelectPaymentProvider: (provider: PaymentInfo['paymentProvider']) => void;
}

export default function PaymentProviderSelection({
  paymentProviders,
  onSelectPaymentProvider,
}: PaymentProviderSelectionProps) {
  const { control, watch } = useFormContext();
  const t = useTranslations('PaymentForm');

  const selectedProvider = watch('paymentProvider');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <FormField
        control={control}
        name="paymentProvider"
        render={({ field }) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => {
                      field.onChange(provider.id);
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
                        {provider.id === 'liqpay' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedProvider === provider.id,
                              'text-[#325039]':
                                selectedProvider !== provider.id,
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
                        {provider.id === 'credit-card' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedProvider === provider.id,
                              'text-[#325039]':
                                selectedProvider !== provider.id,
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
                        {provider.id === 'paypal' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedProvider === provider.id,
                              'text-[#325039]':
                                selectedProvider !== provider.id,
                            })}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        )}
                        {provider.id === 'stripe' && (
                          <svg
                            className={clsx('w-6 h-6', {
                              'text-white': selectedProvider === provider.id,
                              'text-[#325039]':
                                selectedProvider !== provider.id,
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
                          {provider.id === 'credit-card' &&
                            t('creditCardDescription')}
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
