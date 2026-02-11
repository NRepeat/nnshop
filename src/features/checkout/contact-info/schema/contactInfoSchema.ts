import { z } from 'zod';
import { isValidPhone } from '@shared/lib/validation/phone';

const CYRILLIC_NAME_REGEX = /^[а-яА-ЯёЁіІїЇєЄґҐ'\-\s]+$/;
const LATIN_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-@]+$/;

export type ContactInfoFormData = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  preferViber: boolean;
};

export const getContactInfoSchema = (t: (key: string) => string) => {
  return z.object({
    name: z
      .string()
      .min(1, t('nameRequired'))
      .regex(CYRILLIC_NAME_REGEX, t('nameCyrillicOnly')),
    lastName: z
      .string()
      .min(1, t('lastNameRequired'))
      .regex(CYRILLIC_NAME_REGEX, t('lastNameCyrillicOnly')),
    email: z
      .string()
      .min(1, t('invalidEmail'))
      .regex(LATIN_EMAIL_REGEX, t('emailLatinOnly'))
      .email(t('invalidEmail')),
    phone: z
      .string()
      .min(1, t('phoneRequired'))
      .refine((val) => isValidPhone(val), {
        message: t('invalidPhoneNumber'),
      }),
    countryCode: z.string().min(1, t('countryCodeRequired')),
    preferViber: z.boolean().default(false),
  });
};
