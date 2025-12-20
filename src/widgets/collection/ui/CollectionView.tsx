import { getCollection } from '@entities/collection/api/getCollection';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { CollectionFilters } from '@features/collection/ui/CollectionFilters';
import { FilterSheet } from '@features/collection/ui/FilterSheet';
import Link from 'next/link';
import {
  Product,
  ProductFilter,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@shared/ui/pagination';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const PRODUCTS_PER_PAGE = 12;

export default async function CollectionView({
  searchParams,
  slug,
}: {
  slug: string;
  searchParams: {
    filters?: string;
    after?: string;
    before?: string;
  };
}) {
  const t = await getTranslations('CollectionPage');
  if (!slug) {
    return notFound();
  }

  const { filters: filtersString, after, before } = searchParams;
  let filters: ProductFilter[] = [];
  if (filtersString) {
    try {
      filters = JSON.parse(filtersString);
    } catch {}
  }

  const paginationArgs = before
    ? { last: PRODUCTS_PER_PAGE, before }
    : { first: PRODUCTS_PER_PAGE, after };

  const locale = await getLocale();

  const collectionData = await getCollection({
    handle: slug,
    filters,
    ...paginationArgs,
    locale,
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
    <div className="container  ">
      <div className="flex flex-col px-3 mt-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
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
    </div>
  );
}
