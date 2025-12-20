import { getLocale } from 'next-intl/server';
import { CollectionGrid } from './CollectionGrid';
import { notFound } from 'next/navigation';
import { Props } from '~/app/(frontend)/collection/[slug]/page';
import Loading from './GridCollectionLoading';
import { Suspense } from 'react';

export const CollectionSession = async ({ params }: Props) => {
  const { slug } = await params;
  const locale = await getLocale();
  if (!slug || !locale) {
    return notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <CollectionGrid slug={slug} locale={locale} />
    </Suspense>
  );
};
