'use server';
import { cookies } from 'next/headers';
export const setLocale = async (locale: string) => {
  const cookieStore = await cookies();
  console.log('Changing locale to', locale);
  cookieStore.set('locale', locale);
};
