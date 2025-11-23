import { z } from 'zod';

export const getContactInfoSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t('nameRequired')),
    lastName: z.string().min(1, t('lastNameRequired')),
    email: z.string().email(t('invalidEmail')),
    phone: z
      .string()
      .min(1, t('phoneRequired'))
      .regex(/^\+?[1-9]\d{1,14}$/, t('invalidPhoneNumber')),
    countryCode: z.string().min(1, t('countryCodeRequired')),
  });
};
