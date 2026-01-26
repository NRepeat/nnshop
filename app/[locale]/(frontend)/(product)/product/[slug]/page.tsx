import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { auth } from '@features/auth/lib/auth';
import { FavSession } from '@features/header/ui/FavSession';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { ProductSessionView } from '@features/product/ui/ProductSessionView';
import { locales } from '@shared/i18n/routing';
import { Session, User } from 'better-auth';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { getProduct } from '@entities/product/api/getProduct';
import { notFound } from 'next/navigation';
import { Product } from '@shared/lib/shopify/types/storefront.types';

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
export async function generateStaticParams() {
  const params = [];

  for (const locale of locales) {
    const allProductsHandlers = await getAllProductHandles(locale);

    const localeParams = allProductsHandlers.slice(0, 10).map((handle) => ({
      slug: handle,
      locale: locale,
    }));

    params.push(...localeParams);
  }

  return params;
}

export default async function ProductPage({ params }: Props) {
  const { slug: handle, locale } = await params;

  const { originProduct: product } = await getProduct({
    handle,
    locale,
  });

  if (!product) {
    return notFound();
  }
  setRequestLocale(locale);
  return (
    <>
      <ProductSessionView
        handle={handle}
        locale={locale}
      >
        <Suspense>
          <ProductSession
            handle={product.id}
            product={product as Product}
          />
        </Suspense>
      </ProductSessionView>
    </>
  );
}

const ProductSession = async ({
  handle,
  product,
}: {
  handle: string;
  product: Product;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  const isFavorite = await isProductFavorite(handle, session);
  console.log('🚀 ~ ProductPage ~ isFavorite:', isFavorite);
  return <FavSession fav={isFavorite} handle={handle} productId={product.id} />;
};
