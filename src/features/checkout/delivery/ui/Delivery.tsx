import React from 'react';
import DeliveryForm from './DeliveryForm';
import { getDeliveryInfo } from '../api/getDeliveryInfo';
import ContainerHeader from '@entities/checkout/ui/ContainerHeader';
import { getTranslations } from 'next-intl/server';

export default async function Delivery() {
  let existingDeliveryInfo = null;
  try {
    existingDeliveryInfo = await getDeliveryInfo();
  } catch (error) {
    console.error('Error fetching delivery info:', error);
  }
  const t = await getTranslations('CheckoutPage');

  return (
    <div className="col-span-4 lg:col-span-6 lg:h-fit lg:row-start-2 justify-self-stretch">
      <ContainerHeader className="flex justify-between items-center text-[32px]">
        {t('delivery_title')}
      </ContainerHeader>
      <DeliveryForm defaultValues={existingDeliveryInfo} />
    </div>
  );
}
