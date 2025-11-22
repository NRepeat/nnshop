import { z } from 'zod';

// Nova Poshta department schema
export const novaPoshtaDepartmentSchema = z.object({
  id: z.coerce.string().min(1, 'Department ID is required'),
  shortName: z.string().min(1, 'Department name is required'),
  addressParts: z
    .object({
      city: z.string().optional(),
      street: z.string().optional(),
      building: z.string().optional(),
    })
    .optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

// Delivery info validation schema
export const deliverySchema = z
  .object({
    deliveryMethod: z.enum(['novaPoshta', 'ukrPoshta']).default('novaPoshta'),
    // Nova Poshta fields - полная структура данных
    novaPoshtaDepartment: novaPoshtaDepartmentSchema.optional(),
    // UkrPoshta fields
    country: z.string().optional(),
    address: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .refine(
    (data) => {
      // If Nova Poshta is selected, department is required
      if (data.deliveryMethod === 'novaPoshta') {
        return (
          data.novaPoshtaDepartment &&
          data.novaPoshtaDepartment.id &&
          data.novaPoshtaDepartment.shortName
        );
      }
      // If UkrPoshta is selected, address fields are required
      if (data.deliveryMethod === 'ukrPoshta') {
        return data.country && data.address && data.city && data.postalCode;
      }
      return true;
    },
    {
      message:
        'Please fill in all required fields for the selected delivery method',
      path: ['deliveryMethod'],
    },
  );

export type DeliveryInfo = z.infer<typeof deliverySchema>;
export type NovaPoshtaDepartment = z.infer<typeof novaPoshtaDepartmentSchema>;
