import { BrandGrid } from '@features/brand/ui/BrandGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  getCollection,
  getCollectionSlugs,
} from '@entities/collection/api/getCollection';
import { generateBrandMetadata } from '@shared/lib/seo/generateMetadata';
import { notFound } from 'next/navigation';
import { locales } from '@shared/i18n/routing';

export type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getCollectionSlugs();
    const params = [];
    for (const locale of locales) {
      for (const slug of slugs) {
        params.push({ locale, slug });
      }
    }
    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { collection } = await getCollection({
    handle: decodedSlug,
    first: 1,
    locale,
  });

  if (!collection?.collection) {
    notFound();
  }

  return generateBrandMetadata(
    {
      title: collection.collection.title,
      image: collection.collection.image ?? null,
    },
    locale,
    decodedSlug,
  );
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
