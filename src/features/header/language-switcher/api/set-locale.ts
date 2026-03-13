'use server';
import { cookies } from 'next/headers';
export const setLocale = async (locale: string) => {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale);
};
