import { sanityFetch } from '@/shared/sanity/lib/sanityFetch';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { POSTS_BY_LANGUAGE_QUERY } from '@/shared/sanity/lib/query';
import type { POSTS_BY_LANGUAGE_QUERYResult } from '@shared/sanity/types';
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { generatePageMetadata } from '@shared/lib/seo/generateMetadata';
import { PostCard } from '@widgets/post-card';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isUk = locale === 'uk';
  return generatePageMetadata(
    {
      title: isUk ? 'Блог про моду та стиль | MioMio' : 'Блог о моде и стиле | MioMio',
      description: isUk
        ? 'Поради зі стилю, сезонні добірки та практичні гіди з вибору. Нові матеріали в блозі MioMio ✔️'
        : 'Советы по стилю, сезонные подборки и практичные гайды по выбору. Новые материалы в блоге MioMio ✔️',
    },
    locale,
    '/blog',
  );
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const posts = (await sanityFetch({
    query: POSTS_BY_LANGUAGE_QUERY,
    params: { language: sanityLocale },
    revalidate: 3600,
    tags: ['post'],
  })) as POSTS_BY_LANGUAGE_QUERYResult;

  return (
    <div className="container py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Блог</h1>
      <div className="flex flex-col gap-8 divide-y divide-gray-100">
        {posts?.map((post) => (
          <div key={post._id} className="pt-8 first:pt-0">
            <PostCard {...post} currentLocale={locale} />
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-gray-500 py-12 text-center">
            {locale === 'uk' ? 'Публікацій ще немає' : 'Публикаций пока нет'}
          </p>
        )}
      </div>
    </div>
  );
}
