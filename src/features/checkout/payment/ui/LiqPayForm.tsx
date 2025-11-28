'use client';

import React from 'react';
import Liqpay from '@entities/liqpay/ui/Form';
import { useTranslations } from 'next-intl';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';

interface LiqPayFormProps {
  liqpayPublicKey: string;
  liqpayPrivateKey: string;
  shopifyDraftOrderId: string;
  amount: number;
  currency: string;
  checkoutData: Omit<CheckoutData, 'paymentInfo'> | null;
}

export default function LiqPayForm({
  liqpayPublicKey,
  liqpayPrivateKey,
  shopifyDraftOrderId,
  amount,
  currency,
  checkoutData,
}: LiqPayFormProps) {
  const t = useTranslations('PaymentForm');

  return (
    <div className="">
      {/*<div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('completePayment')}
        </h3>
        <p className="text-sm text-gray-600">{t('liqpayDescription')}</p>
      </div>*/}

      <Liqpay
        publicKey={liqpayPublicKey}
        privateKey={liqpayPrivateKey}
        shopifyDraftOrderId={shopifyDraftOrderId}
        amount={amount.toString()}
        action="pay"
        description={`${t('orderPaymentFor')} ${shopifyDraftOrderId}`}
        currency={currency}
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
                deliveryMethod: checkoutData.deliveryInfo.deliveryMethod,
                address: checkoutData.deliveryInfo.address,
                city: checkoutData.deliveryInfo.city,
                departmentName:
                  checkoutData.deliveryInfo.novaPoshtaDepartment?.shortName,
              }
            : undefined
        }
      />
    </div>
  );
}
