'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

const resetCartSession = async (completedOrderId?: string) => {
  try {
    if (completedOrderId) {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: {
            orders: {
              some: {
                id: completedOrderId,
              },
            },
          },
        });
        if (!user) {
          console.warn(
            'User not found for completedOrderId:',
            completedOrderId,
          );
          throw new Error('User not found');
        }
        const sessionCart = await tx.cart.findFirst({
          where: {
            userId: user.id,
            completed: false,
          },
        });
        if (!sessionCart) {
          console.warn('Cart not found sessionCart throwing error.');
          throw new Error('Cart not found');
        }
        await tx.cart.update({
          where: {
            id: sessionCart.id,
            userId: user.id,
            completed: false,
          },
          data: { completed: true },
        });
      });
    } else {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        console.warn(' Session not found, throwing error.');
        throw new Error('Session not found');
      }
      await prisma.$transaction(async (tx) => {
        const sessionCart = await tx.cart.findFirst({
          where: {
            userId: session.user.id,
          },
        });
        if (!sessionCart) {
          console.warn(
            'Cart not found for userId:',
            session.user.id,
            ', throwing error.',
          );
          throw new Error('Cart not found');
        }
        await tx.cart.update({
          where: {
            id: sessionCart.id,
          },
          data: { completed: true },
        });
      });
    }
  } catch (e) {
    console.error(e);
    throw new Error('Failed to reset cart session');
  }
};

export default resetCartSession;
