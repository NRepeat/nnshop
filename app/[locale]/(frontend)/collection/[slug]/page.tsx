import { notFound } from 'next/navigation';
import { getCollections } from '@entities/collection/api/getCollections';
import CollectionView from '@widgets/collection/ui/CollectionView';

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
  const searchParamsData = await searchParams;
  if (!slug) {
    return notFound();
  }

  return <CollectionView searchParams={searchParamsData} slug={slug} />;
}
