'use server';
import { revalidateTag } from 'next/cache';
import { revalidatePath } from 'next/cache';

import { redirect, RedirectType } from 'next/navigation';

export const navigateToQuiuqView = async (slug: string) => {
  revalidateTag(`quiq-view`, { expire: 0 });

  redirect('/product/' + slug, RedirectType.push);
};
