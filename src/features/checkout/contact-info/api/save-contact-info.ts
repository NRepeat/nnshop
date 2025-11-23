'use server';
import { auth } from '@features/auth/lib/auth';
import { contactInfoSchema } from '@features/checkout/schema/contactInfoSchema';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import z from 'zod';

const saveContactInfo = async (data: z.infer<typeof contactInfoSchema>) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const tranaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return await tx.user.update({
        where: { id: user.id },
        data: {
          contactInformation: {
            upsert: {
              where: {
                userId: user.id,
              },
              update: {
                countryCode: data.countryCode,
                email: data.email,
                lastName: data.lastName,
                name: data.name,
                phone: data.phone,
              },
              create: {
                countryCode: data.countryCode,
                email: data.email,
                lastName: data.lastName,
                name: data.name,
                phone: data.phone,
              },
            },
          },
        },
      });
    });
    return tranaction;
  } catch (e) {
    throw new Error(String(e));
  }
};
export default saveContactInfo;
