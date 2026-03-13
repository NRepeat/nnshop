import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import {
  PredictiveSearchQuery,
  PredictiveSearchQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import {
  PredictiveSearchLimitScope,
  SearchableField,
} from '@shared/lib/shopify/types/storefront.types';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/empty';
import { SearchIcon } from 'lucide-react';
import { Skeleton } from '@shared/ui/skeleton';

const PREDICTIVE_SEARCH_QUERY = `#graphql
  query predictiveSearchQuery(
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $query: String!
    $searchableFields: [SearchableField!]
    $types: [PredictiveSearchType!]
  ) {
    predictiveSearch(
      limit: $limit
      limitScope: $limitScope
      query: $query
      searchableFields: $searchableFields
      types: $types
    ) {
      products {
        id
        title
        handle
        metafields(identifiers: [{key: "znizka", namespace: "custom"}]) {
          key
          value
        }
        priceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
          width
          height
        }
        tags
        vendor
        options {
          name
          optionValues {
            name
          }
        }
        media(first: 20) {
          edges {
            node {
              previewImage {
                url
                width
                height
                altText
              }
            }
          }
        }
        variants(first: 250) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container p-4">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchResultsComponent searchParams={searchParams} locale={locale} />
      </Suspense>
    </div>
  );
}

const SearchResultsComponent = async ({
  searchParams,
  locale,
}: {
  searchParams: Props['searchParams'];
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'Search' });
  const seatchPa = await searchParams;
  const query = typeof seatchPa.q === 'string' ? seatchPa.q : undefined;

  const pageTitle = (
    <h1 className="text-2xl font-bold mb-4">
      {query ? `${t('resultsFor')} "${query}"` : t('title')}
    </h1>
  );
  if (!query) {
    return (
      <div className=" mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8">
            {pageTitle}
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>{t('noResults')}</EmptyTitle>
              <EmptyDescription>{t('tryAgain')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    );
  }

  let results: PredictiveSearchQuery['predictiveSearch'] | null = null;
  let errorContent: React.ReactNode | null = null;

  try {
    const response = await storefrontClient.request<
      PredictiveSearchQuery,
      PredictiveSearchQueryVariables
    >({
      query: PREDICTIVE_SEARCH_QUERY,
      variables: {
        limit: 10,
        limitScope: 'EACH' as PredictiveSearchLimitScope,
        query,
        searchableFields: [
          'TITLE',
          'VARIANTS_TITLE',
          'VARIANTS_SKU',
          'VENDOR',
          'PRODUCT_TYPE',
        ] as SearchableField[],
      },
    });
    results = response.predictiveSearch;
  } catch (error) {
    console.error('Error fetching search results:', error);
    errorContent = (
      <>
        {pageTitle}
        <p>{t('errorFetchingResults')}</p>
      </>
    );
  }

  if (errorContent) {
    return errorContent;
  }

  if (!results || !results.products || results.products.length === 0) {
    return (
      <div className=" mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8">
            {pageTitle}
          </div>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>{t('noResults')}</EmptyTitle>
              <EmptyDescription>{t('tryAgain')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className=" mt-8 md:mt-8 h-fit min-h-screen">
      <div className="container">
        <div className="my-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2"> {pageTitle}</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
          {results.products.map((product) => (
            <ProductCardSPP
              product={product as ShopifyProduct}
              key={product.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SearchPageSkeleton = () => {
  return (
    <>
      <Skeleton className="h-8 w-1/3 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="relative aspect-[3/4] w-full" />
            <div className="flex flex-col gap-2 mt-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
