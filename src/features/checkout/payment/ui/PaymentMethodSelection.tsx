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

export default function PaymentMethodSelection({
  paymentMethods,
  setSelectedPaymentMethod,
  setSelectedProvider,
}) {
  const { control } = useFormContext();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <FormField
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="mb-4">
              <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                Choose Payment Method
              </FormLabel>
              <p className="text-sm text-gray-600">
                Select when you would like to pay for your order.
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
                      setSelectedPaymentMethod(method.id);
                      setSelectedProvider('');
                    }}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-200 ${
                      field.value === method.id
                        ? 'border-[#325039] bg-[#325039] text-white shadow-lg'
                        : 'border-gray-200 hover:border-[#325039] hover:shadow-md bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                          field.value === method.id
                            ? 'bg-white/20'
                            : 'bg-[#325039]/10'
                        }`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            field.value === method.id
                              ? 'text-white'
                              : 'text-[#325039]'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {method.id === 'pay-now' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          )}
                          {method.id === 'after-delivered' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                          {method.id === 'pay-later' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          )}
                        </svg>
                      </div>
                      <h3
                        className={`font-semibold text-base ${
                          field.value === method.id
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {method.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          field.value === method.id
                            ? 'text-white/80'
                            : 'text-gray-600'
                        }`}
                      >
                        {method.id === 'pay-now' &&
                          'Pay immediately with card or online'}
                        {method.id === 'after-delivered' &&
                          'Pay after receiving your order'}
                        {method.id === 'pay-later' && 'Pay within 30 days'}
                      </p>
                    </div>
                    {field.value === method.id && (
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
