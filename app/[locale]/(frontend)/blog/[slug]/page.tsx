import { sanityFetch, client } from '@/shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { POST_BY_LANGUAGE_QUERY, POSTS_SLUGS_QUERY } from '@/shared/sanity/lib/query';
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';
import { Post } from '@widgets/post';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const post = await sanityFetch({
    query: POST_BY_LANGUAGE_QUERY,
    params: { slug, language: sanityLocale },
    revalidate: 3600,
  });

  if (!post) {
    return generatePageMetadata({ title: 'Блог | Mio Mio' }, locale, `/blog/${slug}`);
  }

  return generatePageMetadata(
    {
      title: post.seo?.title || `${post.title} | Mio Mio`,
      description: post.seo?.description || '',
      noIndex: post.seo?.noIndex ?? false,
    },
    locale,
    `/blog/${slug}`,
  );
}

export async function generateStaticParams() {
  const posts = await client.fetch(POSTS_SLUGS_QUERY);
  return posts.map((post: { slug: string | null }) => ({ slug: post.slug ?? '' }));
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const post = await sanityFetch({
    query: POST_BY_LANGUAGE_QUERY,
    params: { slug, language: sanityLocale },
    revalidate: 3600,
    tags: ['post'],
  });

  if (!post) notFound();

  return (
    <div className="container py-8">
      <Post {...post} currentLocale={locale} />
    </div>
  );
}
