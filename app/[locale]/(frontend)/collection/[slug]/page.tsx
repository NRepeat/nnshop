import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { locales } from '@shared/i18n/routing';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCollection } from '@entities/collection/api/getCollection';
import { generateCollectionMetadata } from '@shared/lib/seo/generateMetadata';

export type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  try {
    const { collection } = await getCollection({
      handle: slug,
      locale,
      first: 1,
    });

    if (!collection.collection) {
      return { title: 'Collection Not Found' };
    }

    return generateCollectionMetadata(collection.collection, locale, slug);
  } catch {
    return { title: 'Collection Not Found' };
  }
}

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
