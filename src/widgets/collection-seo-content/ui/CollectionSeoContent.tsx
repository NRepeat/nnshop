import { PortableText } from 'next-sanity';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { POST_BY_LANGUAGE_QUERY } from '@shared/sanity/lib/query';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { components } from '@shared/sanity/components/portableText';
import { SeoCurtain } from './SeoCurtain';

/**
 * Maps Shopify collection handle (per gender) to the imported SEO blog post
 * slug for each Sanity locale. Filled in `scripts/import-seo-blog.mjs`.
 */
const COLLECTION_TO_POST_SLUG: Record<
  string,
  { ua: string; ru: string }
> = {
  'woman:zhinoche-vzuttya': {
    ua: 'zhinoche-vzuttia',
    ru: 'zhenskaya-obuv',
  },
  'woman:krosivky-ta-kedy': {
    ua: 'zhinochi-krosivky-ta-kedy',
    ru: 'zhenskie-krossovki-i-kedy',
  },
  'woman:oksfordy-ta-lofery': {
    ua: 'zhinochi-oksfordy-ta-lofery',
    ru: 'zhenskie-oksfordy-i-lofery',
  },
  'woman:sabo-ta-myuli': {
    ua: 'zhinochi-sabo-ta-miuli',
    ru: 'zhenskie-sabo-i-myuli',
  },
  'man:choloviche-vzuttya': {
    ua: 'choloviche-vzuttia',
    ru: 'muzhskaya-obuv',
  },
  'man:krosivky-ta-kedy': {
    ua: 'cholovichi-krosivky-ta-kedy',
    ru: 'muzhskie-krossovki-i-kedy',
  },
};

type Props = {
  gender: string;
  handle: string;
  locale: string;
};

export async function CollectionSeoContent({ gender, handle, locale }: Props) {
  const key = `${gender}:${handle}`;
  const entry = COLLECTION_TO_POST_SLUG[key];
  if (!entry) return null;

  const sanityLocale = (await normalizeLocaleForSanity(locale)) as 'ua' | 'ru';
  const slug = entry[sanityLocale] ?? entry.ua;

  const post = await sanityFetch({
    query: POST_BY_LANGUAGE_QUERY,
    params: { slug, language: sanityLocale },
    revalidate: 3600,
    tags: [`post:${slug}`, 'post'],
  });

  if (!post?.body) return null;

  const isUk = locale === 'uk';
  const showLabel = isUk ? 'Показати більше' : 'Показать больше';
  const hideLabel = isUk ? 'Згорнути' : 'Свернуть';

  return (
    <section
      aria-label="SEO description"
      className="mx-auto mt-12 max-w-4xl border-t border-foreground/10 pt-10 md:mt-16 md:pt-12"
    >
      <SeoCurtain showLabel={showLabel} hideLabel={hideLabel} collapsedHeight={280}>
        {post.title ? (
          <h2 className="mb-6 text-balance text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-[1.15] text-foreground">
            {post.title}
          </h2>
        ) : null}
        <div className="prose-none">
          <PortableText value={post.body} components={components} />
        </div>
      </SeoCurtain>
    </section>
  );
}
