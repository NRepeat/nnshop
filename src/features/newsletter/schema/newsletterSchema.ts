import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  gender: z.enum(['woman', 'man']).default('woman'),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
