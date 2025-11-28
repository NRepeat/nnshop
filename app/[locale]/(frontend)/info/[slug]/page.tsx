import { sanityFetch } from '@/shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY } from '@/shared/sanity/lib/query';
import { PageBuilder } from '@widgets/page-builder';

type Props = {
  params: { slug: string; locale: string };
};

export async function generateStaticParams() {
  const hardcodedSlugs = [
    'contacts',
    'delivery',
    'sustainability',
    'payment-returns',
    'public-offer-agreement',
    'privacy-policy',
  ];

  const locales = ['uk', 'en'];

  // Generate an array of { slug: string, locale: string } objects
  const staticParams = locales.flatMap((locale) =>
    hardcodedSlugs.map((slug) => ({
      slug,
      locale,
    })),
  );

  return staticParams;
}

export default async function InfoPage({ params: { slug, locale } }: Props) {
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
