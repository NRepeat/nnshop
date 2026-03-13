import { z } from 'zod';

export const getContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('nameRequired')),
    email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
    phone: z.string().optional(),
    message: z.string().min(1, t('messageRequired')),
  });

export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};
