'use server';

import { prisma } from '@shared/lib/prisma';
import { NewsletterFormData } from '../schema/newsletterSchema';

export const subscribeToNewsletter = async ({
  email,
  gender,
}: NewsletterFormData): Promise<{ success: boolean }> => {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { gender, subscribedAt: new Date() },
      create: { email, gender },
    });
    return { success: true };
  } catch (error) {
    console.error('[subscribeToNewsletter] failed', {
      step: 'prisma-newsletter',
      error: error instanceof Error ? error.message : String(error),
    });
    // Always return success — duplicate emails are treated silently per CONTEXT.md
    return { success: true };
  }
};
