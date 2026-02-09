import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { locales } from '@shared/i18n/routing';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCollection, getCollectionSlugs } from '@entities/collection/api/getCollection';
import { generateCollectionMetadata } from '@shared/lib/seo/generateMetadata';
import { setRequestLocale } from 'next-intl/server';

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
  try {
    const collectionSlugs = await getCollectionSlugs();
    const params = [];

    for (const locale of locales) {
      for (const slug of collectionSlugs) {
        params.push({ locale, slug });
      }
    }

    return params;
  } catch (error) {
    console.error('Failed to generate static params for collections:', error);
    // Fallback to just locales if fetching slugs fails
    return locales.map(locale => ({ locale, slug: '' }));
  }
}

export type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CollectionPage({ params, searchParams }: Props) {
  const {locale} = await params
  setRequestLocale(locale);
 
  return (
    <div className="container ">
      <Suspense fallback={<CollectionGridSkeleton />}>
        <CollectionGrid params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
