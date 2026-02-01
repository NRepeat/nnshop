'use server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { getDeliverySchema } from '../delivery/model/deliverySchema';
import { getContactInfoSchema } from '../contact-info/schema/contactInfoSchema';
import { getPaymentSchema } from '../payment/schema/paymentSchema';

export const getCheckoutDataSchema = async (locale: string) => {
  const tPayment = await getTranslations({ locale, namespace: 'PaymentForm' });
  const tContact = await getTranslations({ locale, namespace: 'ContactInfoForm' });
  const tDelivery = await getTranslations({ locale, namespace: 'DeliveryForm' });

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
