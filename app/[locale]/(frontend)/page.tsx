import { PageBuilder } from '@/widgets/page-builder';
import { Locale, locales } from '@/shared/i18n/routing';

type RouteProps = {
  params: Promise<{ locale: Locale }>;
};

import { getPage } from '@/features/home/api/get-home-page';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page({ params }: RouteProps) {
  const page = await getPage(params);
  return page?.homePage?.content ? (
    <PageBuilder
      //@ts-expect-error sanity
      content={page.homePage.content}
      documentId={page.homePage._id}
      documentType={page.homePage._type}
    />
  ) : (
    <div>
      <h1>Page Not Found</h1>
    </div>
  );
}
