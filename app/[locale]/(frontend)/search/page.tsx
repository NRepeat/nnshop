import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import {
  predictiveSearch,
  SearchResultsGrid,
  SearchEmpty,
  SearchSkeleton,
} from '@features/search';
import { Skeleton } from '@shared/ui/skeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `${base}/${locale}/search` },
  };
}

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
          <div className="my-8">{pageTitle}</div>
          <SearchEmpty />
        </div>
      </div>
    );
  }

  let results;
  try {
    results = await predictiveSearch({ query, locale });
  } catch (error) {
    console.error('Error fetching search results:', error);
    return (
      <>
        {pageTitle}
        <p>{t('errorFetchingResults')}</p>
      </>
    );
  }

  if (!results || !results.products || results.products.length === 0) {
    return (
      <div className=" mt-8 md:mt-8 h-fit min-h-screen">
        <div className="container">
          <div className="my-8">{pageTitle}</div>
          <SearchEmpty />
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
        <SearchResultsGrid
          products={results.products as ShopifyProduct[]}
        />
      </div>
    </div>
  );
};

const SearchPageSkeleton = () => {
  return (
    <>
      <Skeleton className="h-8 w-1/3 mb-4" />
      <SearchSkeleton />
    </>
  );
};
