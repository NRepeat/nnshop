import { prisma } from '@shared/lib/prisma';

export const saveOrder = async (orderId: string, cartToken: string) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { cartToken: cartToken },
    });
    if (!cart) throw new Error('Cart not found');

    await prisma.order.create({
      data: {
        shopifyOrderId: orderId,
        userId: cart.userId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to save order');
  }
};
