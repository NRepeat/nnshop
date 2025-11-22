'use client';

import React from 'react';
import Liqpay from '@entities/liqpay/ui/Form';

export default function LiqPayForm({
  liqpayPublicKey,
  liqpayPrivateKey,
  orderId,
  amount,
  currency,
  checkoutData,
}) {
  return (
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
