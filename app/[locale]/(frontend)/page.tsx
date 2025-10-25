import { PageBuilder } from '@/components/sanity/PageBuilder';
import { Locale, locales } from '@/i18n/routing';
import { normalizeLocaleForSanity } from '@/lib/locale';
import { sanityFetch } from '@/sanity/lib/client';
import { HOME_PAGE_QUERY } from '@/sanity/lib/query';
import { HOME_PAGE_QUERYResult } from '@/sanity/types';

type RouteProps = {
  params: { locale: Locale };
};

const getPage = async (params: RouteProps['params']) => {
  const { locale } = params;

  const sanityLocale = await normalizeLocaleForSanity(locale);

  const page = (await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { language: sanityLocale },
    revalidate: 3600,
  })) as HOME_PAGE_QUERYResult;
  return page;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page({ params }: RouteProps) {
  const page = await getPage(params);
  return page?.homePage?.content ? (
    <>
      {/*<h2 className="text-2xl font-bold mb-4">{page.homePage.title[locale]}</h2>*/}
      <PageBuilder
        //@ts-expect-error sanity
        content={page.homePage.content}
        documentId={page.homePage._id}
        documentType={page.homePage._type}
      />
    </>
  ) : (
    <div>
      <h1>Page Not Found</h1>
    </div>
  );
}
