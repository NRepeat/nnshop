'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export async function saveGenderPreference(gender: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Если пользователь не авторизован, ничего не делаем (будет использоваться cookie)
    if (!session?.user) {
      return { success: false, message: 'User not authenticated' };
    }

    // Сохраняем предпочтение в БД только для авторизованных пользователей
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredGender: gender },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save gender preference:', error);
    return { success: false, error: 'Failed to save gender preference' };
  }
}

export async function getGenderPreference(): Promise<string> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Если пользователь не авторизован, вернём дефолтное значение
    if (!session?.user) {
      return 'woman';
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredGender: true },
    });

    return user?.preferredGender || 'woman';
  } catch (error) {
    console.error('Failed to get gender preference:', error);
    return 'woman';
  }
}
