import { z } from 'zod';

// Payment info validation schema
export const paymentSchema = z.object({
  paymentMethod: z
    .enum(['pay-now', 'after-delivered', 'pay-later'])
    .default('pay-now'),
  paymentProvider: z
    .enum(['liqpay', 'credit-card', 'paypal', 'stripe'])
    .default('liqpay'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  orderId: z.string().min(1, 'Order ID is required'),
  description: z.string().optional(),
});

export type PaymentInfo = z.infer<typeof paymentSchema>;
