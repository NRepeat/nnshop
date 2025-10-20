import { sanityFetch } from '@/sanity/lib/live';
import { notFound } from 'next/navigation';

import { POST_QUERY } from '@/sanity/lib/query';

import { Post } from '@/components/blog/Post';
import { urlFor } from '@/sanity/lib/image';
import { Metadata } from 'next';

type RouteProps = {
  params: Promise<{ slug: string }>;
};
const getPage = async (params: RouteProps['params']) =>
  await sanityFetch({
    query: POST_QUERY,
    params: await params,
  });

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { data: page } = await getPage(params);

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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { data: post } = await getPage(params);

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Post {...post} />
    </main>
  );
}
