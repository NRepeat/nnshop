import { getCollection } from '@entities/collection/api/getCollection';
import { notFound } from 'next/navigation';
import { ProductCard } from '@entities/product/ui/ProductCard';
import {
  Product,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';
import { CollectionFilters } from './CollectionFilters';
import { FilterSheet } from './FilterSheet';
import { getCollections } from '@entities/collection/api/getCollections';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/shared/ui/pagination';
import { getTranslations } from 'next-intl/server';
import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';

const PRODUCTS_PER_PAGE = 12;

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{
    filters?: string;
    after?: string;
    before?: string;
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
  const t = await getTranslations('CollectionPage');
  if (!slug) {
    return notFound();
  }

  const { filters: filtersString, after, before } = await searchParams;
  let filters: ProductFilter[] = [];
  if (filtersString) {
    try {
      filters = JSON.parse(filtersString);
    } catch {}
  }

  const paginationArgs = before
    ? { last: PRODUCTS_PER_PAGE, before }
    : { first: PRODUCTS_PER_PAGE, after };

  const collectionData = await getCollection({
    handle: slug,
    filters,
    ...paginationArgs,
  });
  const collection = collectionData.collection;

  if (!collection) {
    return notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);
  const { hasNextPage, endCursor, hasPreviousPage, startCursor } =
    collection.products.pageInfo;
  const getFilterParams = (currentFilters: string | undefined): string => {
    return currentFilters ? `&filters=${currentFilters}` : '';
  };

  const filterParams = getFilterParams(filtersString);
  if (collection.products.edges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600">{t('noProducts')}</p>
        <Button size="lg" className="mt-4 rounded-none">
          <Link href={'/'}>{t('explore')}</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
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
          <div className="grid grid-cols-2 gap-2 sm:gap-2 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4 ">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
                className="pl-0 pr-0"
              />
            ))}
          </div>

          {(hasPreviousPage || hasNextPage) && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {hasPreviousPage && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/collection/${slug}?before=${startCursor}${filterParams}`}
                      />
                    </PaginationItem>
                  )}

                  {hasNextPage && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/collection/${slug}?after=${endCursor}${filterParams}`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
