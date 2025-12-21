import { getCollectionSlugs } from '@entities/collection/api/getCollection';
import { Suspense } from 'react';
import Loading from '@features/collection/ui/GridCollectionLoading';
import { CollectionSession } from '@features/collection/ui/CollectionSession';

export type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{
  //   filters?: string;
  //   after?: string;
  //   before?: string;
  // }>;
};

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function CollectionPage({ params }: Props) {
  return (
    <div className="container ">
      <Suspense fallback={<Loading />}>
        <CollectionSession params={params} />
      </Suspense>
    </div>
  );
}
