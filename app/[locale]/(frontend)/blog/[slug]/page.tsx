import { client } from '@/shared/sanity/lib/client';
import { sanityFetch } from '@/shared/sanity/lib/sanityFetch';
import { urlFor } from '@/shared/sanity/lib/image';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import {
  POST_BY_LANGUAGE_QUERY,
  POSTS_SLUGS_QUERY,
} from '@/shared/sanity/lib/query';
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { generatePageMetadata, stripInvisible } from '@shared/lib/seo/generateMetadata';
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
    tags: [`post:${slug}`],
  });

  if (!post) {
    return generatePageMetadata(
      { title: 'Блог | MioMio' },
      locale,
      `/blog/${slug}`,
    );
  }

  const isUk = locale === 'uk';
  const ogImage =
    post.seo?.image
      ? urlFor(post.seo.image).width(1200).height(630).url()
      : post.mainImage
        ? urlFor(post.mainImage).width(1200).height(630).url()
        : undefined;

  const fallbackDescription = isUk
    ? 'Читайте в блозі MioMio: поради зі стилю, добірки та практичні гіди з вибору взуття й одягу.'
    : 'Читайте в блоге MioMio: советы по стилю, подборки и практичные гайды по выбору обуви и одежды.';

  const cleanTitle = stripInvisible(post.seo?.title || `${post.title} | MioMio`);
  const altTranslation = post.translations?.filter(Boolean).find(
    (t) => isUk ? t?.language === 'ru' : t?.language === 'uk' || t?.language === 'ua',
  );
  const ukSlug = isUk ? slug : (altTranslation?.slug ?? slug);
  const ruSlug = isUk ? (altTranslation?.slug ?? slug) : slug;

  return {
    ...generatePageMetadata(
      {
        title: cleanTitle,
        description: post.seo?.description || fallbackDescription,
        noIndex: post.seo?.noIndex ?? false,
        image: ogImage,
      },
      locale,
      `/blog/${slug}`,
    ),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua'}/${locale}/blog/${slug}`,
      languages: {
        uk: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua'}/uk/blog/${ukSlug}`,
        ru: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua'}/ru/blog/${ruSlug}`,
        'x-default': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua'}/uk/blog/${ukSlug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const posts = await client.fetch(POSTS_SLUGS_QUERY);
  return posts.map((post: { slug: string | null }) => ({
    slug: post.slug ?? '',
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const post = await sanityFetch({
    query: POST_BY_LANGUAGE_QUERY,
    params: { slug, language: sanityLocale },
    tags: [`post:${slug}`],
  });

  if (!post) notFound();

  return (
    <div className="  space-y-12 my-8 h-fit min-h-screen">
      <div className="container">
        <Post {...post} currentLocale={locale} />
      </div>
    </div>
  );
}
