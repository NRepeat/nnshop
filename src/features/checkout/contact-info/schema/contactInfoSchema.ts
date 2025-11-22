import { z } from 'zod';

export const contactInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  countryCode: z.string().min(1, 'Country code is required'),
});
