import { getLocale } from 'next-intl/server';
import { CollectionGrid } from './CollectionGrid';
import { notFound } from 'next/navigation';
import { Props } from '~/app/(frontend)/collection/[slug]/page';

export const CollectionSession = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  // const searchParamsData = await searchParams;
  const locale = await getLocale();
  if (!slug || !locale) {
    return notFound();
  }

  return (
    <CollectionGrid
      slug={slug}
      locale={locale}
      // searchParams={searchParams}
    />
  );
};
