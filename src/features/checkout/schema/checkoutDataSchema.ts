'use server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { getDeliverySchema } from '../delivery/model/deliverySchema';
import { getContactInfoSchema } from '../contact-info/schema/contactInfoSchema';
import { getPaymentSchema } from '../payment/schema/paymentSchema';

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
