'use client';

import React, { useEffect, useState } from 'react';
import Liqpay from '@entities/liqpay/ui/Form';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { useTranslations } from 'next-intl';

export default function LiqPayForm({
  liqpayPublicKey,
  liqpayPrivateKey,
  orderId,
  amount,
  currency,
}) {
  const t = useTranslations('PaymentForm');
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    async function loadCheckoutData() {
      const data = await getCompleteCheckoutData();
      setCheckoutData(data);
    }
    loadCheckoutData();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('completePayment')}
        </h3>
        <p className="text-sm text-gray-600">{t('liqpayDescription')}</p>
      </div>

      <Liqpay
        publicKey={liqpayPublicKey}
        privateKey={liqpayPrivateKey}
        orderId={orderId}
        amount={amount.toString()}
        action="pay"
        description={`${t('orderPaymentFor')} ${orderId}`}
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
