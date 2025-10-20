import { PageBuilder } from '@/components/sanity/PageBuilder';
import { sanityFetch } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { PAGE_QUERY } from '@/sanity/lib/query';
import { Metadata } from 'next';

type RouteProps = {
  params: Promise<{ slug: string }>;
};

const getPage = async (params: RouteProps['params']) =>
  sanityFetch({
    query: PAGE_QUERY,
    params: await params,
  });

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const page = await getPage(params);

  if (!page) {
    return {};
  }

  const metadata: Metadata = {
    metadataBase: new URL('https://close-dane-shining.ngrok-free.app'),
    title: page.seo.title,
    description: page.seo.description,
  };

  metadata.openGraph = {
    images: {
      url: page.seo.image
        ? urlFor(page.seo.image).width(1200).height(630).url()
        : `/api/og?id=${page._id}`,
      width: 1200,
      height: 630,
    },
  };

  if (page.seo.noIndex) {
    metadata.robots = 'noindex';
  }

  return metadata;
}

export default async function Page({ params }: RouteProps) {
  const page = await getPage(params);
  return page?.content ? (
    <PageBuilder
      content={page.content}
      documentId={page._id}
      documentType={page._type}
    />
  ) : null;
}
