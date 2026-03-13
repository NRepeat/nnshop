'use server';

import { prisma } from '@shared/lib/prisma';
import { NewsletterFormData } from '../schema/newsletterSchema';

const ESPUTNIK_BASE = 'https://esputnik.com/api/v1';

function esputnikAuth(): string {
  const login = process.env.ESPUTNIK_API_LOGIN ?? '';
  const key = process.env.ESPUTNIK_API_KEY ?? '';
  return `Basic ${Buffer.from(`${login}:${key}`).toString('base64')}`;
}

async function addEsputnikContact(email: string, gender: string): Promise<void> {
  const res = await fetch(`${ESPUTNIK_BASE}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: esputnikAuth(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dedupeOn: 'email',
      contacts: [{ channels: [{ type: 'email', value: email }] }],
      groupNames: [gender], // 'woman' or 'man' — static segment names in eSputnik
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eSputnik subscribe error: ${res.status} — ${body}`);
  }
}

export const subscribeToNewsletter = async ({
  email,
  gender,
}: NewsletterFormData): Promise<{ success: boolean }> => {
  // 1. Save to local DB
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { gender, subscribedAt: new Date() },
      create: { email, gender },
    });
  } catch (error) {
    console.error('[subscribeToNewsletter] prisma failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 2. Add contact to eSputnik (fire-and-forget — never block the user)
  addEsputnikContact(email, gender).catch((error) => {
    console.error('[subscribeToNewsletter] esputnik failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return { success: true };
};
