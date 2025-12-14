'use server';

import { cookies } from 'next/headers';

export async function cookieFenderSet(gender: string) {
  const cookieStore = await cookies();
  cookieStore.set('gender', gender);
  console.log('cookie set', gender);
}
