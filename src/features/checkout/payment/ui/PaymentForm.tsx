'use client';

import React, { useState } from 'react';
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

  const onSubmit: SubmitHandler<PaymentInfo> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create the Shopify order
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

      // 2. Save payment info (need to find the DB order by shopifyOrderId)
      // The createOrder function already saved it to DB, find it
      await savePaymentInfo(data, createdOrder.id);

      // 3. Reset the cart
      await resetCartSession();

      // 4. Redirect to success page
      toast.success(t('paymentInformationSaved'));
      router.push(`/checkout/success/${encodeURIComponent(orderName)}`);
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(t('errorSavingPaymentInformation'));
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Form {...form}>
        {form.formState.isSubmitted &&
          Object.keys(form.formState.errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
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
            className="w-full h-12 bg-green-800 rounded-md"
            disabled={isLoading}
            onClick={async () => {
              await onSubmit({
                amount: form.getValues('amount'),
                currency: form.getValues('currency'),
                orderId: form.getValues('orderId'),
                paymentMethod: form.getValues('paymentMethod'),
                paymentProvider: form.getValues('paymentProvider'),
                description: form.getValues('description'),
              });
            }}
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
