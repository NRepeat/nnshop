import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductCard } from '@entities/product/ui/ProductCard';
import {
  Product,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { CollectionFilters } from './CollectionFilters';
import { getTranslations } from 'next-intl/server';
import { FilterSheet } from './FilterSheet';
import { getCollections } from '@entities/collection/api/getCollections';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{
    filters?: string;
  }>;
};
export async function generateStaticParams() {
  const { collections } = await getCollections();

  const paths = collections.edges.flatMap((edge) => {
    return ['en', 'uk'].map((locale) => ({
      slug: edge.node.handle,
      locale: locale,
    }));
  });

  return paths;
}
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!slug) {
    return notFound();
  }

  const t = await getTranslations('CollectionPage');
  const { filters: filtersString } = await searchParams;
  let filters: ProductFilter[] = [];
  if (filtersString) {
    try {
      filters = JSON.parse(filtersString);
    } catch (e) {}
  }

  const collectionData = await getCollection({
    handle: slug,
    filters,
  });
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        {collection.image && (
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
            <Image
              src={collection.image.url}
              alt={collection.image?.altText || collection.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        {collection.description && (
          <p className="text-lg text-gray-600">{collection.description}</p>
        )}
      </header>
      <div className="lg:hidden mb-4">
        <FilterSheet filters={collection.products.filters} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <CollectionFilters filters={collection.products.filters} />
          </div>
        </aside>
        <main className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-2  sm:gap-2 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4 ">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
                className="pl-0 pr-0"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
