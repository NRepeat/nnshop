import { sanityFetch } from '@/shared/sanity/lib/client';
import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { PAGE_QUERY } from '@shared/sanity/lib/query';
import { PageBuilder } from '@widgets/page-builder';

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const { locale } = await params;

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
