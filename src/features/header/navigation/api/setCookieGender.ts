'use server';

import { cookies } from 'next/headers';

export async function cookieFenderSet(gender: string) {
  const cookieStore = await cookies();
  cookieStore.set('gender', gender);
  console.log('cookie set', gender);
}

export async function cookieFenderGet() {
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender');
  console.log('cookie get', gender);
  return gender?.value;
}
