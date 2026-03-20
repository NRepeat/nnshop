import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { CollectionGridSkeleton } from '@features/collection/ui/CollectionGridSkeleton';
import { locales } from '@shared/i18n/routing';
import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  getCollection,
  getCollectionSlugs,
} from '@entities/collection/api/getCollection';
import { resolveCollectionHandle, detectGenderFromHandle } from '@entities/collection/lib/resolve-handle';
import { generateCollectionMetadata } from '@shared/lib/seo/generateMetadata';
import { setRequestLocale } from 'next-intl/server';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { COLLECTION_IS_BRAND_QUERY } from '@shared/sanity/lib/query';
import { redirect } from 'next/navigation';

export type SearchParams = { [key: string]: string | string[] | undefined };

export type Props = {
  params: Promise<{ locale: string; slug: string; gender: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale, gender } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const allSlugs = await getCollectionSlugs();
    const resolvedHandle = resolveCollectionHandle(decodedSlug, gender, new Set(allSlugs));

    const [{ collection, alternateHandle }, sanityCollection] = await Promise.all([
      getCollection({
        handle: resolvedHandle,
        locale,
        first: 1,
      }),
      sanityFetch({
        query: COLLECTION_IS_BRAND_QUERY,
        params: { handle: resolvedHandle },
        tags: [`collection:${resolvedHandle}`],
      }),
    ]);

    if (!collection.collection?.id) {
      return { title: 'Collection Not Found' };
    }

    const displayTitle =
      sanityCollection?.customTitle?.[locale as 'uk' | 'ru'] ||
      collection.collection.title;

    return generateCollectionMetadata(
      {
        ...collection.collection,
        title: displayTitle,
      },
      locale,
      slug,
      gender,
      alternateHandle,
    );
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
    return locales.map((locale) => ({ locale, slug: '' }));
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { locale, slug, gender } = await params;
  setRequestLocale(locale);


  const decodedSlug = decodeURIComponent(slug);
  const allSlugs = await getCollectionSlugs();
  const resolvedHandle = resolveCollectionHandle(decodedSlug, gender, new Set(allSlugs));

  const [sanityCollection, { collection }] = await Promise.all([
    sanityFetch({
      query: COLLECTION_IS_BRAND_QUERY,
      params: { handle: resolvedHandle },
      tags: [`collection:${resolvedHandle}`],
    }),
    getCollection({ handle: resolvedHandle, first: 1, locale }),
  ]);

  if (sanityCollection?.isBrand) {
    redirect(`/${locale}/brand/${resolvedHandle}`);
  }

  const canonicalHandle = collection.collection?.handle;

  if (canonicalHandle && resolvedHandle !== canonicalHandle) {
    redirect(`/${locale}/${gender}/${canonicalHandle}`);
  }

  if (canonicalHandle) {
    const collectionGender = detectGenderFromHandle(canonicalHandle);
    if (collectionGender && collectionGender !== gender) {
      redirect(`/${locale}/${collectionGender}/${canonicalHandle}`);
    }
  }

  return (
    <div className="container mb-10">
      <Suspense fallback={<CollectionGridSkeleton />}>
        <CollectionGrid params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
