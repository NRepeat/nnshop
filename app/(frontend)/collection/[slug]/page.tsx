import { notFound } from 'next/navigation';
import {
  getCollection,
  getCollectionSlugs,
} from '@entities/collection/api/getCollection';
import { PageInfo, Product } from '@shared/lib/shopify/types/storefront.types';
import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { cacheLife } from 'next/cache';
import LoadMore from '@features/collection/ui/LoadMore';
import { ClientGrid } from '@features/collection/ui/ClientGrid';
import Loading from '@features/collection/ui/GridCollectionLoading';
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    filters?: string;
    after?: string;
    before?: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function CollectionPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <CollectionSession params={params} searchParams={searchParams} />
    </Suspense>
  );
}
const CollectionSession = async ({ params, searchParams }: Props) => {
  const { slug } = await params;
  const searchParamsData = await searchParams;
  const locale = await getLocale();
  if (!slug || !locale) {
    return notFound();
  }

  return (
    <CollectionGrid
      slug={slug}
      locale={locale}
      searchParams={searchParamsData}
    />
  );
};
const CollectionGrid = async ({
  slug,
  locale,
  searchParams,
}: {
  slug: string;
  locale: string;
  searchParams: {
    filters?: string;
    after?: string;
    before?: string;
  };
}) => {
  'use cache';
  cacheLife({ revalidate: 60, stale: 60 });
  const collectionData = await getCollection({
    handle: slug,
    first: 20,
    locale: locale,
    after: searchParams.after || undefined,
    before: searchParams.before || undefined,
  });
  if (!collectionData) {
    return notFound();
  }
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }
  const pageInfo = collectionData.collection?.products.pageInfo;
  const products = collection.products.edges.map((edge) => edge.node);
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-2 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4 ">
        <ClientGrid products={products as Product[]} />
      </div>
      <LoadMore pageInfo={pageInfo as PageInfo} />
    </>
  );
};
