import { z } from 'zod';

// Payment info validation schema
export const getPaymentSchema = (t: (key: string) => string) =>
  z.object({
    paymentMethod: z.enum(['pay-now', 'after-delivered', 'pay-later']),
    paymentProvider: z.enum([
      'bank-transfer',
      'after-delivered',
    ]),
    amount: z.number().min(0.01, t('amountMustBeGreaterThanZero')),
    currency: z.string().default('UAH'),
    orderId: z.string().optional(),
    description: z.string().optional(),
  });

export type PaymentInfo = z.infer<ReturnType<typeof getPaymentSchema>>;
