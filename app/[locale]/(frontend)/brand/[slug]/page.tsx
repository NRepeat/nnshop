import { BrandGrid } from '@features/brand/ui/BrandGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCollection } from '@entities/collection/api/getCollection';

export type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { collection } = await getCollection({
      handle: decodedSlug,
      first: 1,
      locale,
    });

    if (!collection) {
      return { title: 'Brand Not Found' };
    }

    return {
      title: `${collection.collection?.title}`,
      description: collection.collection?.description,
    };
  } catch {
    return { title: 'Brand Not Found' };
  }
}

export default async function BrandPage({ params, searchParams }: Props) {
  return (
    <div className="container">
      <Suspense fallback={<CollectionGridSkeleton />}>
        <BrandGrid params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
