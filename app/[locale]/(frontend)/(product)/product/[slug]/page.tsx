import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { auth } from '@features/auth/lib/auth';
import { setLocale } from '@features/header/language-switcher/api/set-locale';
import { ProductSessionView } from '@features/product/ui/ProductSessionView';
import { locales } from '@shared/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};
// export async function generateStaticParams() {
//   const params = [];
//   for (const locale of locales) {
//     params.push({ locale: locale });
//   }
//   return params;
// }
// export async function generateStaticParams() {
//   const params = [];

//   for (const locale of locales) {
//     const allProductsHandlers = await getAllProductHandles(locale);

//     // Map the handles to the expected param shape immediately
//     const localeParams = allProductsHandlers.map((handle) => ({
//       slug: handle,
//       locale: locale, // Now 'locale' is correctly scoped here
//     }));

//     params.push(...localeParams);
//   }

//   return params;
// }

export default async function ProductPage({ params }: Props) {
  return <ProductSession params={params} />;
}

const ProductSession = async ({ params }: Props) => {
  const { slug: handle, locale } = await params;
  setRequestLocale(locale);
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) {
  //   return notFound();
  // }
  return <ProductSessionView handle={handle} locale={locale} />;
};
