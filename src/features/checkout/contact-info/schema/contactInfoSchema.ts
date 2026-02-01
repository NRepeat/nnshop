import { z } from 'zod';
import { isValidPhone } from '@shared/lib/validation/phone';

export const getContactInfoSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    lastName: z.string().min(1, t('lastNameRequired')),
    email: z.string().email(t('invalidEmail')),
    phone: z
      .string()
      .min(1, t('phoneRequired'))
      .refine((val) => isValidPhone(val), {
        message: t('invalidPhoneNumber'),
      }),
    countryCode: z.string().min(1, t('countryCodeRequired')),
  });
};
