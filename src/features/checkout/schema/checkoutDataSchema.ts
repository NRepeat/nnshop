import { z } from 'zod';
import { paymentSchema } from '../payment/schema/paymentSchema';

// Combined checkout data schema
export const checkoutDataSchema = z.object({
  contactInfo: z.object({
    name: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  deliveryInfo: z.object({
    deliveryMethod: z.string(),
    novaPoshtaDepartment: z
      .object({
        id: z.string(),
        shortName: z.string(),
        addressParts: z
          .object({
            city: z.string().optional(),
            street: z.string().optional(),
            building: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  paymentInfo: paymentSchema,
});

export type CheckoutData = z.infer<typeof checkoutDataSchema>;
