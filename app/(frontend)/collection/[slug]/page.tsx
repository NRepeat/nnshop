import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';

export type SearchParams = { [key: string]: string | string[] | undefined };

export type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const awaitedSearchParams = await searchParams;
  const locale = await getLocale();
  const effectiveLocale = locale;

  return (
    <div className="container ">
      <Suspense fallback={<CollectionGridSkeleton />}>
        <CollectionGrid
          slug={slug}
          locale={effectiveLocale}
          gender={'man'}
          searchParams={awaitedSearchParams}
        />
      </Suspense>
    </div>
  );
}
