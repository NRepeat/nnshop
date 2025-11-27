import { sanityFetch } from '@/shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from '@/shared/sanity/lib/query';
import { PageBuilder } from '@widgets/page-builder';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  const slugs = [
    'contacts',
    'delivery',
    'payment-returns',
    'public-offer-agreement',
    'privacy-policy',
  ];
  const pages = await sanityFetch({
    query: PAGE_SLUGS_QUERY,
    revalidate: 60,
  });

  return pages
    .filter((page) => page.language)
    .map((page) => ({ slug: page.slug, locale: page.language! }));
}

export default async function InfoPage({ params }: Props) {
  const { slug, locale } = await params;
  const sanityLocale = await normalizeLocaleForSanity(locale);

  const pageContent = await sanityFetch({
    query: PAGE_QUERY,
    params: { language: sanityLocale, slug },

    revalidate: 3600,
  });
  return (
    <article className=" container prose md:prose-lg lg:prose-xl mb-10">
      <PageBuilder
        //@ts-ignore
        content={pageContent?.content}
        //@ts-ignore
        documentId={pageContent?._id}
        language={locale}
        documentType="page"
      />
    </article>
  );
}
