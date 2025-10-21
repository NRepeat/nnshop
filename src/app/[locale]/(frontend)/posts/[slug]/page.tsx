import { notFound } from 'next/navigation';

import {
  POST_BY_LANGUAGE_QUERY,
  POST_WITH_FALLBACK_QUERY,
  POSTS_SLUGS_BY_LANGUAGE_QUERY,
} from '@/sanity/lib/query';

import { Post } from '@/components/blog/Post';
import { urlFor } from '@/sanity/lib/image';
import { Metadata } from 'next';
import { client, sanityFetch } from '@/sanity/lib/client';
import { normalizeLocaleForSanity, getDefaultLocale } from '@/lib/locale';

type RouteProps = {
  params: Promise<{ slug: string; locale: string }>;
};
const getPage = async (params: RouteProps['params']) => {
  const { slug, locale } = await params;

  // Normalize locale for Sanity (ensures it exists in Sanity)
  const sanityLocale = await normalizeLocaleForSanity(locale);

  // Get post for current locale first
  let post = await sanityFetch({
    query: POST_BY_LANGUAGE_QUERY,
    params: { slug, language: sanityLocale },
    revalidate: 3600,
  });

  // If no post found in current locale and it's not English, try English fallback
  if (!post && sanityLocale !== 'en') {
    post = await sanityFetch({
      query: POST_WITH_FALLBACK_QUERY,
      params: { slug },
      revalidate: 3600,
    });
  }

  return post;
};
export async function generateStaticParams() {
  const posts = await client
    .withConfig({ useCdn: false })
    .fetch(POSTS_SLUGS_BY_LANGUAGE_QUERY, { language: 'en' });

  const enPosts = posts.map((post) => ({
    slug: post.slug,
    locale: 'en',
  }));

  const uaPosts = await client
    .withConfig({ useCdn: false })
    .fetch(POSTS_SLUGS_BY_LANGUAGE_QUERY, { language: 'ua' });

  const uaPostsFormatted = uaPosts.map((post) => ({
    slug: post.slug,
    locale: 'ua',
  }));

  return [...enPosts, ...uaPostsFormatted];
}
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale } = await params;
  const post = await getPage(params);

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Post {...post} currentLocale={locale} />
    </main>
  );
}
