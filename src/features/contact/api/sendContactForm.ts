'use server';

import { sendEvent } from '@shared/lib/mailer';
import { ContactFormData } from '../schema/contactSchema';

export async function sendContactForm(data: ContactFormData): Promise<{ success: boolean }> {
  await sendEvent({
    eventTypeKey: 'contact_form',
    keyValue: data.email,
    params: {
      name: data.name,
      EmailAddress: data.email,
      phone: data.phone ?? '',
      message: data.message,
    },
  });

  return { success: true };
}
