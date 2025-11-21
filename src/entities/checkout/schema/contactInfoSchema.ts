import { z } from 'zod';

export function formatPhoneForShopify(
  phone: string,
  countryCode: string,
): string {
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned.startsWith('+')) {
    const countryPrefixes: Record<string, string> = {
      UA: '+380',
      US: '+1',
      GB: '+44',
      DE: '+49',
      FR: '+33',
      IT: '+39',
      ES: '+34',
      PL: '+48',
      CA: '+1',
      AU: '+61',
    };

    const prefix = countryPrefixes[countryCode] || '+380';
    cleaned = prefix + cleaned;
  }

  return cleaned;
}

export const contactInfoSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\+]?[0-9\s\-\(\)]{7,20}$/,
      'Please enter a valid phone number (7-20 digits)',
    ),
  countryCode: z
    .string()
    .min(2, 'Country code is required')
    .max(2, 'Country code must be 2 characters')
    .default('UA'),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;
