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

export default function PaymentProviderSelection({
  paymentProviders,
  setSelectedProvider,
}) {
  const { control } = useFormContext();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <FormField
        control={control}
        name="paymentProvider"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                Choose Payment Provider
              </FormLabel>
              <p className="text-sm text-gray-600">
                Select your preferred payment method for secure processing.
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
                      setSelectedProvider(provider.id);
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      field.value === provider.id
                        ? 'border-[#325039] bg-[#325039] text-white shadow-lg'
                        : 'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          field.value === provider.id
                            ? 'bg-white/20'
                            : 'bg-[#325039]/10'
                        }`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            field.value === provider.id
                              ? 'text-white'
                              : 'text-[#325039]'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {provider.id === 'liqpay' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          )}
                          {provider.id === 'credit-card' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          )}
                          {provider.id === 'paypal' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          )}
                          {provider.id === 'stripe' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3
                          className={`font-semibold text-base ${
                            field.value === provider.id
                              ? 'text-white'
                              : 'text-gray-900'
                          }`}
                        >
                          {provider.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            field.value === provider.id
                              ? 'text-white/80'
                              : 'text-gray-600'
                          }`}
                        >
                          {provider.id === 'liqpay' && 'Secure online payments'}
                          {provider.id === 'credit-card' &&
                            'Credit or debit card'}
                          {provider.id === 'paypal' &&
                            'Pay with PayPal account'}
                          {provider.id === 'stripe' &&
                            'Stripe payment processing'}
                        </p>
                      </div>
                    </div>
                    {field.value === provider.id && (
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
            <FormMessage className="text-red-500 text-sm mt-2" />
          </FormItem>
        )}
      />
    </div>
  );
}
