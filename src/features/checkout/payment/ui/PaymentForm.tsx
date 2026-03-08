'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from '@shared/i18n/navigation';
import { PaymentInfo, getPaymentSchema } from '../schema/paymentSchema';
import { savePaymentInfo } from '../api/savePaymentInfo';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import LiqPayForm from './LiqPayForm';
import PaymentMethodSelection from './PaymentMethodSelection';
import PaymentProviderSelection from './PaymentProviderSelection';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentMethods, paymentProviders } from '../lib/constants';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import resetCartSession from '@features/cart/api/resetCartSession';
import { createOrder } from '@features/order/api/create';
import { useSession } from '@features/auth/lib/client';
import { usePostHog } from 'posthog-js/react';

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
  currency = 'UAH',
  locale,
  liqpayPublicKey,
  liqpayPrivateKey,
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
      paymentMethod: defaultValues?.paymentMethod || 'after-delivered',
      paymentProvider: defaultValues?.paymentProvider || 'bank-transfer',
      amount: amount,
      currency: currency || defaultValues?.currency,
      description: defaultValues?.description || 'Order payment',
    },
  });
  const selectedPaymentMethodValue = form.watch('paymentMethod');
  const selectedProviderValue = form.watch('paymentProvider');
  const [isLoading, setIsLoading] = useState(false);
  const [liqpayOrderId, setLiqpayOrderId] = useState<string | null>(null);
  const { data: session } = useSession();
  const posthog = usePostHog();
  const [isMerging, setIsMerging] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id ?? null;
    // Only lock when user identity changes (anonymous → identified session merge)
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== userId) {
      setIsMerging(true);
      const timer = setTimeout(() => setIsMerging(false), 1500);
      prevUserIdRef.current = userId;
      return () => clearTimeout(timer);
    }
    prevUserIdRef.current = userId;
  }, [session?.user?.id]);

  const onSubmit: SubmitHandler<PaymentInfo> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Fire payment_initiated before creating the order
      posthog?.capture('payment_initiated', {
        payment_method: data.paymentMethod,
        amount: amount,
        currency: currency,
      });

      // 2. Create the Shopify order
      const orderResult = await createOrder(
        completeCheckoutData,
        locale,
        false,
        data.paymentMethod,
      );

      if (!orderResult.success || !orderResult.order) {
        toast.error(orderResult.errors?.[0] || t('errorSavingPaymentInformation'));
        setIsLoading(false);
        return;
      }

      const createdOrder = orderResult.order;
      const orderName = (createdOrder.name || createdOrder.id.split('/').pop() || '').replace('#', '');

      // Fire order_placed after confirmed order success
      posthog?.capture('order_placed', {
        order_id: createdOrder.id,
        order_name: orderName,
        amount: amount,
        currency: currency,
        payment_method: data.paymentMethod,
      });

      // 3. Save payment info (need to find the DB order by shopifyOrderId)
      // The createOrder function already saved it to DB, find it
      await savePaymentInfo(data, createdOrder.id);

      // 3. Reset the cart (best-effort — order already exists in Shopify)
      try {
        await resetCartSession();
      } catch (resetError) {
        console.error('[PaymentForm] resetCartSession failed (non-blocking):', resetError);
      }

      // 4a. LiqPay disabled temporarily — skip and redirect to success page directly
      // if (data.paymentMethod === 'pay-now' && data.paymentProvider === 'bank-transfer') {
      //   setLiqpayOrderId(createdOrder.id);
      //   setIsLoading(false);
      //   return;
      // }

      // 4b. All methods: redirect to success page immediately
      toast.success(t('paymentInformationSaved'));
      router.push(`/checkout/success/${encodeURIComponent(orderName)}`);
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(t('errorSavingPaymentInformation'));
      setIsLoading(false);
    }
  };

  if (liqpayOrderId && liqpayPublicKey && liqpayPrivateKey) {
    return (
      <LiqPayForm
        liqpayPublicKey={liqpayPublicKey}
        liqpayPrivateKey={liqpayPrivateKey}
        shopifyOrderId={liqpayOrderId}
        amount={amount}
        currency={currency}
        checkoutData={completeCheckoutData}
      />
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
          onSelectPaymentMethod={(method: string) =>
            form.setValue(
              'paymentMethod',
              method as PaymentInfo['paymentMethod'],
            )
          }
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
            disabled={isMerging || isLoading}
            // @ts-ignore
            onClick={form.handleSubmit(onSubmit)}
          >
            {isMerging ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t('completePayment')}</span>
              </div>
            ) : isLoading ? (
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
