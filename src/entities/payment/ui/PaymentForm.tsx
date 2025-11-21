'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { PaymentInfo, paymentSchema } from '../shema';
import { getCompleteCheckoutData } from '../api/getCompleteCheckoutData';
import { savePaymentInfo } from '../api/savePaymentInfo';
import { Button } from '@shared/ui/button';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@shared/ui/form';
import LiqPay from '@entities/liqpay/model';
import Liqpay from '@entities/liqpay/ui/Form';

interface PaymentFormProps {
  defaultValues?: PaymentInfo | null;
  orderId: string;
  amount: number;
  currency?: string;
  liqpayPublicKey?: string;
  liqpayPrivateKey?: string;
}

export default function PaymentForm({
  defaultValues,
  orderId,
  amount,
  currency = 'USD',
  liqpayPublicKey,
  liqpayPrivateKey,
}: PaymentFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState('pay-now');
  const [selectedProvider, setSelectedProvider] = React.useState('');
  const [checkoutData, setCheckoutData] = React.useState<any>(null);

  const form = useForm<z.infer<typeof paymentSchema>>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
    shouldUnregister: false,
    defaultValues: {
      paymentMethod: defaultValues?.paymentMethod || 'pay-now',
      paymentProvider: defaultValues?.paymentProvider || 'liqpay',
      amount: amount,
      currency: defaultValues?.currency || currency,
      orderId: orderId,
      description: defaultValues?.description || 'Order payment',
    },
  });

  const selectedPaymentMethodValue = form.watch('paymentMethod');
  const selectedProviderValue = form.watch('paymentProvider');

  // Load complete checkout data
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const data = await getCompleteCheckoutData();
        setCheckoutData(data);
      } catch (error) {
        console.error('Error loading checkout data:', error);
      }
    };
    loadCheckoutData();
  }, []);

  React.useEffect(() => {
    if (
      selectedPaymentMethodValue === 'pay-now' &&
      selectedProviderValue === 'liqpay'
    ) {
      const currentData = form.getValues();
      savePaymentInfo(currentData).catch(console.error);
    }
  }, [selectedPaymentMethodValue, selectedProviderValue, form]);

  async function onSubmit(data: z.infer<typeof paymentSchema>) {
    // Manual validation using zod
    const validationResult = paymentSchema.safeParse(data);

    if (!validationResult.success) {
      // Set form errors manually
      const errors = validationResult.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages[0]) {
          form.setError(field as keyof typeof data, {
            type: 'manual',
            message: messages[0],
          });
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await savePaymentInfo(data);

      if (result.success) {
        toast.success(result.message);

        // If LiqPay is selected, the form will handle the payment
        if (data.paymentProvider === 'liqpay') {
          // LiqPay form will be rendered below
          return;
        }

        // For other payment methods, navigate to success page
        router.push(`/${locale}/checkout/success/${data.orderId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      toast.error('An error occurred while saving your payment information.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const paymentMethods = [
    {
      id: 'pay-now',
      name: 'Pay Now',
      availableMethods: ['liqpay', 'credit-card', 'paypal', 'stripe'],
    },
    { id: 'after-delivered', name: 'After Delivered', availableMethods: [] },
    { id: 'pay-later', name: 'Pay Later', availableMethods: [] },
  ];

  const paymentProviders = [
    {
      id: 'liqpay',
      name: 'LiqPay',
      component: (
        <div
          onClick={() => setSelectedProvider('liqpay')}
          className={`p-4 border rounded-md cursor-pointer transition-all ${
            selectedProviderValue === 'liqpay'
              ? 'border-[#325039] bg-[#325039] text-white'
              : 'border-gray-300 hover:border-[#325039]'
          }`}
        >
          LiqPay
        </div>
      ),
    },
    {
      id: 'credit-card',
      name: 'Credit Card',
      component: (
        <div
          onClick={() => setSelectedProvider('credit-card')}
          className={`p-4 border rounded-md cursor-pointer transition-all ${
            selectedProviderValue === 'credit-card'
              ? 'border-[#325039] bg-[#325039] text-white'
              : 'border-gray-300 hover:border-[#325039]'
          }`}
        >
          Credit Card
        </div>
      ),
    },
    {
      id: 'paypal',
      name: 'PayPal',
      component: (
        <div
          onClick={() => setSelectedProvider('paypal')}
          className={`p-4 border rounded-md cursor-pointer transition-all ${
            selectedProviderValue === 'paypal'
              ? 'border-[#325039] bg-[#325039] text-white'
              : 'border-gray-300 hover:border-[#325039]'
          }`}
        >
          PayPal
        </div>
      ),
    },
    {
      id: 'stripe',
      name: 'Stripe',
      component: (
        <div
          onClick={() => setSelectedProvider('stripe')}
          className={`p-4 border rounded-md cursor-pointer transition-all ${
            selectedProviderValue === 'stripe'
              ? 'border-[#325039] bg-[#325039] text-white'
              : 'border-gray-300 hover:border-[#325039]'
          }`}
        >
          Stripe
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General form errors - only show after submit attempt */}
          {form.formState.isSubmitted &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-red-800 font-semibold text-sm">
                    Please fix the following errors:
                  </h4>
                </div>
                <ul className="text-red-700 text-sm space-y-2 ml-9">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error?.message}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <FormField
              control={form.control}
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
                              {method.id === 'pay-later' &&
                                'Pay within 30 days'}
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

          {/* Payment Provider Selection - only show for "Pay Now" */}
          {selectedPaymentMethodValue === 'pay-now' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <FormField
                control={form.control}
                name="paymentProvider"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="mb-4">
                      <FormLabel className="text-lg font-semibold text-gray-900 mb-2 block">
                        Choose Payment Provider
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        Select your preferred payment method for secure
                        processing.
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
                                  {provider.id === 'liqpay' &&
                                    'Secure online payments'}
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
          )}

          {/* LiqPay Form - only show when LiqPay is selected */}
          {selectedPaymentMethodValue === 'pay-now' &&
            selectedProviderValue === 'liqpay' &&
            liqpayPublicKey &&
            liqpayPrivateKey && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Complete Payment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Secure payment processing through LiqPay
                  </p>
                </div>

                <Liqpay
                  publicKey={liqpayPublicKey}
                  privateKey={liqpayPrivateKey}
                  orderId={orderId}
                  amount={amount.toString()}
                  action="pay"
                  description={`Order payment for ${orderId}`}
                  currency={form.getValues('currency')}
                  language="en"
                  customerInfo={
                    checkoutData?.contactInfo
                      ? {
                          name: checkoutData.contactInfo.name,
                          lastName: checkoutData.contactInfo.lastName,
                          email: checkoutData.contactInfo.email,
                          phone: checkoutData.contactInfo.phone,
                        }
                      : undefined
                  }
                  deliveryInfo={
                    checkoutData?.deliveryInfo
                      ? {
                          deliveryMethod:
                            checkoutData.deliveryInfo.deliveryMethod,
                          address: checkoutData.deliveryInfo.address,
                          city: checkoutData.deliveryInfo.city,
                          departmentName:
                            checkoutData.deliveryInfo.novaPoshtaDepartment
                              ?.shortName,
                        }
                      : undefined
                  }
                />
              </div>
            )}

          {/* Submit Button - only show for non-LiqPay methods */}
          {!(
            selectedPaymentMethodValue === 'pay-now' &&
            selectedProviderValue === 'liqpay'
          ) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <Button
                type="submit"
                className="w-full h-14 bg-[#325039] hover:bg-[#2a4330] text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
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
                    <span>Complete Payment</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
