'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_CURRENCY_CODE } from '@shared/config/shop';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from '@shared/i18n/navigation';
import { PaymentInfo, getPaymentSchema } from '../schema/paymentSchema';
import { savePaymentInfo } from '../api/savePaymentInfo';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import PaymentMethodSelection from './PaymentMethodSelection';
import PaymentProviderSelection from './PaymentProviderSelection';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentMethods, paymentProviders } from '../lib/constants';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import resetCartSession from '@features/cart/api/resetCartSession';
import { createOrder } from '@features/order/api/create';
interface PaymentFormProps {
  defaultValues?: PaymentInfo | null;
  amount: number;
  currency?: string;
  locale: string;
  liqpayPublicKey?: string;
  liqpayPrivateKey?: string;
  completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null;
}

export default function PaymentForm({
  defaultValues,
  amount,
  currency = DEFAULT_CURRENCY_CODE,
  locale,
  completeCheckoutData,
}: PaymentFormProps) {
  const router = useRouter();
  const t = useTranslations('PaymentForm');
  const paymentSchema = getPaymentSchema(t);
  const form = useForm<PaymentInfo>({
    //@ts-ignore
    resolver: zodResolver(paymentSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
    shouldUnregister: false,
    defaultValues: {
      paymentMethod: defaultValues?.paymentMethod || 'pay-now',
      paymentProvider:
        defaultValues?.paymentProvider ||
        (defaultValues?.paymentMethod === 'after-delivered'
          ? 'after-delivered'
          : undefined),
      amount: amount,
      currency: currency || defaultValues?.currency,
      description: defaultValues?.description || 'Order payment',
    },
  });
  const selectedPaymentMethodValue = form.watch('paymentMethod');
  const selectedPaymentProviderValue = form.watch('paymentProvider');
  const [isLoading, setIsLoading] = useState(false);
  const [liqpayParams, setLiqpayParams] = useState<{
    data: string;
    signature: string;
  } | null>(null);
  const liqpaySubmitRef = useRef<HTMLButtonElement>(null);

  // Try to auto-click the LiqPay submit button once it's rendered.
  // On non-Safari browsers this succeeds; on Safari the user sees the button
  // and can click it manually as a fallback.
  useEffect(() => {
    if (liqpayParams && liqpaySubmitRef.current) {
      console.log('[PaymentForm] LiqPay: auto-clicking submit button');
      liqpaySubmitRef.current.click();
    }
  }, [liqpayParams]);

  const onSubmit: SubmitHandler<PaymentInfo> = async (data) => {
    console.log('[PaymentForm] submit:', data.paymentMethod, data.paymentProvider);
    setIsLoading(true);
    try {
      // 4a. LiqPay: use a regular API fetch instead of server actions.
      // Server actions trigger RSC refresh which races against the form POST to
      // liqpay.ua → Next.js "Falling back to browser navigation" overrides it.
      if (data.paymentMethod === 'pay-now' && data.paymentProvider === 'liqpay') {
        console.log('[PaymentForm] LiqPay: calling API route');
        const res = await fetch('/api/checkout/liqpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, amount, currency }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('[PaymentForm] LiqPay API error:', err);
          toast.error(err.error || t('errorSavingPaymentInformation'));
          setIsLoading(false);
          return;
        }
        const params = await res.json();
        console.log('[PaymentForm] LiqPay: rendering form');
        setLiqpayParams(params);
        return;
      }

      // 4b. All other methods: create order via server action
      const orderResult = await createOrder(
        completeCheckoutData,
        locale,
        false,
        data.paymentMethod,
      );

      if (!orderResult.success || !orderResult.order) {
        console.error('[PaymentForm] createOrder failed:', orderResult.errors);
        toast.error(orderResult.errors?.[0] || t('errorSavingPaymentInformation'));
        setIsLoading(false);
        return;
      }

      const createdOrder = orderResult.order;
      console.log('[PaymentForm] order created:', createdOrder.id);
      const orderName = (createdOrder.name || createdOrder.id.split('/').pop() || '').replace('#', '');

      await savePaymentInfo(data, createdOrder.id);

      // 4b. All other methods: reset cart, then redirect to success page.
      // Safe to reset here because we're navigating away immediately after.
      try {
        await resetCartSession();
        console.log('[PaymentForm] cart reset after non-liqpay order', createdOrder.id);
      } catch (resetError) {
        console.error('[PaymentForm] resetCartSession failed (non-blocking):', resetError);
      }

      toast.success(t('paymentInformationSaved'));
      router.push(`/checkout/success/${encodeURIComponent(orderName)}`);
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(t('errorSavingPaymentInformation'));
      setIsLoading(false);
    }
  };

  // After order is created, show the LiqPay payment form.
  // The useEffect above tries to auto-click the submit button.
  // If Safari blocks it, the user sees a visible "Pay" button as fallback.
  if (liqpayParams) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12 gap-6">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-green-800 rounded-full animate-spin" />
          <span>{t('processingPayment')}</span>
        </div>
        <form
          method="POST"
          action="https://www.liqpay.ua/api/3/checkout"
          acceptCharset="utf-8"
          className="flex flex-col items-center gap-3"
        >
          <input type="hidden" name="data" value={liqpayParams.data} />
          <input type="hidden" name="signature" value={liqpayParams.signature} />
          <button
            ref={liqpaySubmitRef}
            type="submit"
            className="px-6 py-3 bg-green-800 text-white font-semibold rounded hover:bg-green-700 transition-colors"
          >
            {t('completePayment')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        {form.formState.isSubmitted &&
          Object.keys(form.formState.errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h4 className="text-red-800 font-medium text-sm mb-2">
                {t('pleaseFixErrors')}
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                    {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

        <PaymentMethodSelection
          paymentMethods={paymentMethods}
          onSelectPaymentMethod={(method: string) => {
            form.setValue(
              'paymentMethod',
              method as PaymentInfo['paymentMethod'],
            );
            // If After Delivered is selected, automatically set the provider
            if (method === 'after-delivered') {
              form.setValue('paymentProvider', 'after-delivered');
            } else {
              // Reset provider when switching back to Pay Now to force manual selection
              // @ts-ignore
              form.setValue('paymentProvider', undefined);
            }
          }}
        />

        {selectedPaymentMethodValue === 'pay-now' && (
          <PaymentProviderSelection
            paymentProviders={paymentProviders}
            onSelectPaymentProvider={(provider: string) =>
              form.setValue(
                'paymentProvider',
                provider as PaymentInfo['paymentProvider'],
              )
            }
          />
        )}

        <div className="space-y-3">
          <Button
            className="w-full h-12 bg-green-800 rounded"
            disabled={isLoading || !selectedPaymentProviderValue}
            // @ts-ignore
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t('processingPayment')}</span>
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
                <span>{t('completePayment')}</span>
              </div>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t('managerConfirmationNotice')}
          </p>
        </div>
      </Form>
    </div>
  );
}
