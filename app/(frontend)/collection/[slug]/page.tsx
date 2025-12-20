import { notFound } from 'next/navigation';
import { getCollections } from '@entities/collection/api/getCollections';
import CollectionView from '@widgets/collection/ui/CollectionView';
import {
  getCollection,
  getCollectionSlugs,
} from '@entities/collection/api/getCollection';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { cacheLife } from 'next/cache';
type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{
  //   filters?: string;
  //   after?: string;
  //   before?: string;
  // }>;
};

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  console.log('slugs', slugs);
  // const paths = collections.edges.flatMap((edge) => {
  //   return ['en', 'uk'].map((locale) => ({
  //     slug: edge.node.handle,
  //     locale: locale,
  //   }));
  // });

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function CollectionPage({ params }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionSession params={params} />
    </Suspense>
  );
  // return <CollectionView searchParams={searchParamsData} slug={slug} />;
}
const CollectionSession = async ({ params }: Props) => {
  const { slug } = await params;
  const locale = await getLocale();
  // const searchParamsData = await searchParams;
  if (!slug || !locale) {
    return notFound();
  }

  return <CollectionGrid slug={slug} locale={locale} />;
  // return <CollectionView searchParams={searchParamsData} slug={slug} />;
};
const CollectionGrid = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) => {
  'use cache';
  cacheLife({ revalidate: 60, stale: 60 });
  const collectionData = await getCollection({
    handle: slug,
    first: 10,
    locale: locale,
  });
  if (!collectionData) {
    return notFound();
  }
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }
  const products = collection.products.edges.map((edge) => edge.node);
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4 ">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product as Product}
          className="pl-0 pr-0"
          withCarousel
        />
      ))}
    </div>
  );
};
