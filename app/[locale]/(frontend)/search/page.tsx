// app/[locale]/(frontend)/search/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@shared/ui/empty';
import { SearchIcon } from 'lucide-react';
import { Skeleton } from '@shared/ui/skeleton';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// This is the static shell of the page
export default async function SearchPage({ params, searchParams }: Props) {
  // Await the params promise to get the locale
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto p-4">
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
      <>
        {pageTitle}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>{t('noResults')}</EmptyTitle>
            <EmptyDescription>{t('tryAgain')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }

  let results: PredictiveSearchQuery['predictiveSearch'] | null = null;
  let errorContent: React.ReactNode | null = null;

  try {
    // Using an absolute URL is important for fetch in Server Components

    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/predictive-search`,
      {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!apiResponse.ok) {
      console.error('Error fetching search results:', apiResponse.statusText);
      errorContent = (
        <>
          {pageTitle}
          <p>{t('errorFetchingResults')}</p>
        </>
      );
    } else {
      results = await apiResponse.json();
    }
  } catch (error) {
    console.error('Network error fetching search results:', error);
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
      <>
        {pageTitle}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>{t('noResults')}</EmptyTitle>
            <EmptyDescription>{t('tryAgain')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    );
  }

  return (
    <>
      {pageTitle}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
        {results.products.map((product) => (
          <ProductCardSPP
            product={product as ShopifyProduct}
            key={product.id}
          />
        ))}
      </div>
    </>
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
