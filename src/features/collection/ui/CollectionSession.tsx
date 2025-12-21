import { getLocale } from 'next-intl/server';
import { CollectionGrid } from './CollectionGrid';
import { notFound } from 'next/navigation';
import { Props } from '~/app/(frontend)/collection/[slug]/page';
import { cookies } from 'next/headers';

export const CollectionSession = async ({ params }: Props) => {
  const { slug } = await params;
  const locale = await getLocale();
  if (!slug || !locale) {
    return notFound();
  }
  const cookiesStore = await cookies();
  const gender = cookiesStore.get('gender')?.value;
  return <CollectionGrid slug={slug} locale={locale} gender={gender} />;
};
