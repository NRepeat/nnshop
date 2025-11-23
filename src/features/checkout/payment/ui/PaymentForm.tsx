'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { PaymentInfo, getPaymentSchema } from '../schema/paymentSchema';
import { savePaymentInfo } from '../api/savePaymentInfo';
import { Button } from '@shared/ui/button';
import { Form } from '@shared/ui/form';
import LiqPayForm from './LiqPayForm';
import PaymentMethodSelection from './PaymentMethodSelection';
import PaymentProviderSelection from './PaymentProviderSelection';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';

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
      paymentProvider: defaultValues?.paymentProvider || 'liqpay',
      amount: amount,
      currency: defaultValues?.currency || currency,
      orderId: orderId,
      description: defaultValues?.description || 'Order payment',
    },
  });

  const selectedPaymentMethodValue = form.watch('paymentMethod');
  const selectedProviderValue = form.watch('paymentProvider');

  const onSubmit: SubmitHandler<PaymentInfo> = async (data) => {
    try {
      const result = await savePaymentInfo(data);

      if (result.success) {
        toast.success(t('paymentInformationSaved'));

        if (data.paymentProvider === 'liqpay') {
          return;
        }

        router.push(`/${locale}/checkout/success/${data.orderId}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      toast.error(t('errorSavingPaymentInformation'));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {form.formState.isSubmitted &&
            Object.keys(form.formState.errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-medium text-sm mb-2">
                  {t('pleaseFixErrors')}
                </h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(form.formState.errors).map(
                    ([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                        {error?.message}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

          <PaymentMethodSelection
            paymentMethods={paymentMethods}
            // Pass form.setValue directly for paymentMethod
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
              // Pass form.setValue directly for paymentProvider
              onSelectPaymentProvider={(provider: string) =>
                form.setValue(
                  'paymentProvider',
                  provider as PaymentInfo['paymentProvider'],
                )
              }
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
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
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
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
