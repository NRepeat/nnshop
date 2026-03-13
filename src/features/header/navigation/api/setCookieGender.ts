'use server';

import { cookies } from 'next/headers';

export async function cookieGenderSet(gender: string) {
  const cookieStore = await cookies();
  cookieStore.set('gender', gender);
}

export async function cookieGenderGet() {
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender');
  return gender?.value;
}
