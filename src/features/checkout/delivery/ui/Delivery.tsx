import React from 'react';
import DeliveryForm from './DeliveryForm';
import { getDeliveryInfo } from '../api/getDeliveryInfo';
import ContainerHeader from '@entities/checkout/ui/ContainerHeader';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';

export default async function Delivery({ locale }: { locale: string }) {
  let existingDeliveryInfo = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    existingDeliveryInfo = await getDeliveryInfo(session);
  } catch (error) {
    console.error('Error fetching delivery info:', error);
  }
  const t = await getTranslations({ locale, namespace: 'CheckoutPage' });

  return (
    <div className="">
      <ContainerHeader className="flex justify-between items-center text-[32px]">
        {t('delivery_title')}
      </ContainerHeader>
      <DeliveryForm defaultValues={existingDeliveryInfo} />
    </div>
  );
}
