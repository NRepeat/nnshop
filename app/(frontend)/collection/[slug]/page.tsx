import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { getLocale } from 'next-intl/server';

export type SearchParams = { [key: string]: string | string[] | undefined };

export type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug, locale: paramLocale } = await params;
  const awaitedSearchParams = await searchParams;
  const locale = await getLocale();
  const effectiveLocale = paramLocale || locale;

  return (
    <div className="container ">
      <CollectionGrid
        slug={slug}
        locale={effectiveLocale}
        gender={'man'}
        searchParams={awaitedSearchParams}
      />
    </div>
  );
}
