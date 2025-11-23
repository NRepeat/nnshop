import { z } from 'zod';

// Payment info validation schema
export const getPaymentSchema = (t: (key: string) => string) =>
  z.object({
    paymentMethod: z
      .enum(['pay-now', 'after-delivered', 'pay-later'])
      .default('pay-now'),
    paymentProvider: z
      .enum(['liqpay', 'credit-card', 'paypal', 'stripe'])
      .default('liqpay'),
    amount: z.number().min(0.01, t('amountMustBeGreaterThanZero')),
    currency: z.string().default('USD'),
    orderId: z.string().min(1, t('orderIdIsRequired')),
    description: z.string().optional(),
  });

export type PaymentInfo = z.infer<ReturnType<typeof getPaymentSchema>>;
