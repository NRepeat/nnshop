import React from 'react';
import ContainerHeader from '@entities/checkout/ui/ContainerHeader';
import DeliveryForm from '@entities/checkout/ui/DeliveryForm';
import { getDeliveryInfo } from '@entities/checkout/api/getDeliveryInfo';

export default async function Delivery() {
  let existingDeliveryInfo = null;
  try {
    existingDeliveryInfo = await getDeliveryInfo();
  } catch (error) {
    console.error('Error fetching delivery info:', error);
  }

  return (
    <div className="col-span-4 lg:col-span-6 lg:h-fit lg:row-start-2 justify-self-stretch">
      <ContainerHeader className="flex justify-between items-center text-[32px]">
        Delivery
      </ContainerHeader>
      <DeliveryForm defaultValues={existingDeliveryInfo} />
    </div>
  );
}
