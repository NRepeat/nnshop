import { getCollectionSlugs } from '@entities/collection/api/getCollection';
import { Suspense } from 'react';
import Loading from '@features/collection/ui/GridCollectionLoading';
import { CollectionSession } from '@features/collection/ui/CollectionSession';
import { CollectionGrid } from '@features/collection/ui/CollectionGrid';
import { getLocale } from 'next-intl/server';

export type Props = {
  params: Promise<{ slug: string; locale: string }>;
  // searchParams: Promise<{
  //   filters?: string;
  //   after?: string;
  //   before?: string;
  // }>;
};

// export async function generateStaticParams() {
//   const slugs = await getCollectionSlugs();
//   return slugs.map((slug) => ({
//     slug,
//   }));
// }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  return (
    <div className="container ">
      <Suspense fallback={<Loading />}>
        {/*<CollectionSession params={params} />*/}
        <CollectionGrid slug={slug} locale={locale} gender={'man'} />
      </Suspense>
    </div>
  );
}
