import { z } from 'zod';
import { DEFAULT_GENDER } from '@shared/config/shop';

export const newsletterSchema = z.object({
  email: z.string().email('Введіть коректний email'),
  gender: z.enum(['woman', 'man']).default(DEFAULT_GENDER),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
