import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { locales } from '@shared/i18n/routing';
import { Suspense } from 'react';

export type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CollectionPage({ params, searchParams }: Props) {
  return (
    <div className="container ">
      <Suspense fallback={<CollectionGridSkeleton />}>
        <CollectionGrid params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
