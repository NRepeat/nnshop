'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { PaymentInfo, paymentSchema } from '../schema/paymentSchema';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { savePaymentInfo } from '../api/savePaymentInfo';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import LiqPayForm from './LiqPayForm';
import PaymentMethodSelection from './PaymentMethodSelection';
import PaymentProviderSelection from './PaymentProviderSelection';

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
    },
    {
      id: 'credit-card',
      name: 'Credit Card',
    },
    {
      id: 'paypal',
      name: 'PayPal',
    },
    {
      id: 'stripe',
      name: 'Stripe',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <PaymentMethodSelection
            paymentMethods={paymentMethods}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            setSelectedProvider={setSelectedProvider}
          />

          {selectedPaymentMethodValue === 'pay-now' && (
            <PaymentProviderSelection
              paymentProviders={paymentProviders}
              setSelectedProvider={setSelectedProvider}
            />
          )}

          {selectedPaymentMethodValue === 'pay-now' &&
            selectedProviderValue === 'liqpay' &&
            liqpayPublicKey &&
            liqpayPrivateKey && (
              <LiqPayForm
                liqpayPublicKey={liqpayPublicKey}
                liqpayPrivateKey={liqpayPrivateKey}
                orderId={orderId}
                amount={amount}
                currency={form.getValues('currency')}
                checkoutData={checkoutData}
              />
            )}

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
