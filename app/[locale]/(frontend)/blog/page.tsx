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
      title: isUk
        ? 'Блог про моду та стиль | MioMio'
        : 'Блог о моде и стиле | MioMio',
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

  const isUk = locale === 'uk';
  const heading = isUk ? 'Блог' : 'Блог';
  const lede = isUk
    ? 'Поради зі стилю, сезонні добірки та гіди з вибору взуття й одягу.'
    : 'Советы по стилю, сезонные подборки и гайды по выбору обуви и одежды.';
  const eyebrow = isUk ? 'Журнал MioMio' : 'Журнал MioMio';
  const empty = isUk ? 'Публікацій ще немає' : 'Публикаций пока нет';

  const [featured, ...rest] = posts ?? [];

  return (
    <div className="min-h-screen pt-16 pb-8 md:pt-24 md:pb-24">
      <header className="container ">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-foreground/50">
          {eyebrow}
        </p>
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-[1.05] text-foreground">
          {heading}
        </h1>
        <p className="mt-3 max-w-lg text-pretty text-sm md:text-base text-foreground/60 leading-relaxed">
          {lede}
        </p>
      </header>

      <div className="container">
        {featured ? (
          <section className="border-t border-foreground/10 pt-6 md:pt-8 pb-10 md:pb-14">
            <PostCard {...featured} currentLocale={locale} variant="featured" />
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section className="border-t border-foreground/10 pt-8 md:pt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {rest.map((post) => (
                <PostCard key={post._id} {...post} currentLocale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        {(!posts || posts.length === 0) && (
          <p className="border-t border-foreground/10 py-24 text-center text-foreground/50">
            {empty}
          </p>
        )}
      </div>
    </div>
  );
}
