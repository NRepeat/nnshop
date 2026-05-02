import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import {
  SearchPageContent,
  SearchSkeleton,
  SearchScrollMemory,
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
      {/* Mount scroll-memory at page level (OUTSIDE Suspense) so it
          intercepts browser native restoration during the streaming
          loading state. Without this, the browser snaps to the bottom
          of the short fallback skeleton and stays there after streaming. */}
      <SearchScrollMemory />
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const SearchPageSkeleton = () => (
  <>
    <Skeleton className="h-8 w-1/3 mb-4" />
    <SearchSkeleton />
  </>
);
