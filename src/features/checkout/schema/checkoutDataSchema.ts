'use server';
import { z } from 'zod';
import { getPaymentSchema } from '../payment/model/paymentSchema';
import { getTranslations } from 'next-intl/server';
import { getContactInfoSchema } from '@features/checkout/contact-info/model/contactInfoSchema';
import { getDeliverySchema } from '../delivery/model/deliverySchema';

export const getCheckoutDataSchema = async () => {
  const tPayment = await getTranslations('PaymentForm');
  const tContact = await getTranslations('ContactInfoForm');
  const tDelivery = await getTranslations('DeliveryForm');

  const checkoutDataSchema = z.object({
    contactInfo: getContactInfoSchema(tContact),
    deliveryInfo: getDeliverySchema(tDelivery),
    paymentInfo: getPaymentSchema(tPayment),
  });
  return checkoutDataSchema;
};

export type CheckoutData = z.infer<
  Awaited<ReturnType<typeof getCheckoutDataSchema>>
>;
