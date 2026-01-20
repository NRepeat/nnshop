import { getProduct } from '@/entities/product/api/getProduct';
import { ProductView } from '@/widgets/product-view';
import { getMetaobject } from '@entities/metaobject/api/get-metaobject';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { auth } from '@features/auth/lib/auth';
import { locales } from '@shared/i18n/routing';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};
export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}
// export async function generateStaticParams() {
//   const handles = [];
//   for (const locale of locales) {
//     const allProductsHandlers = await getAllProductHandles(locale);
//     handles.push(...allProductsHandlers);
//   }
//   return handles.map((handle) => ({
//     slug: [handle],
//   }));
// }

export default async function ProductPage({ params }: Props) {
  return <ProductSession params={params} />;
}
const ProductSessionView = async ({
  handle,
  locale,
}: {
  handle: string;
  locale: string;
}) => {
  'use cache';
  try {
    const response = await getProduct({ handle, locale });

    const product = response?.product;

    if (!product) {
      return notFound();
    }
    // const res = await getMetaobject();
    const relatedProducts = product.metafields.find(
      (m) => m?.key === 'recommended_products',
    )?.value as any as string;
    const relatedProductsData = relatedProducts
      ? (JSON.parse(relatedProducts) as string[])
      : [];
    const relatedProductsIds =
      relatedProductsData.length > 0
        ? relatedProductsData
            .map((id) => id.split('/').pop() || null)
            .filter((id) => id !== null)
        : [];

    const relatedShopiyProductsData = await getReletedProducts(
      relatedProductsIds,
      locale,
    );
    const boundProductsIds = product.metafields.find(
      (m) => m?.key === 'bound-products',
    )?.value as any as string;
    const parsedBoundProducts = boundProductsIds
      ? (JSON.parse(boundProductsIds) as string[])
      : [];
    const boundProductsData =
      parsedBoundProducts.length > 0
        ? parsedBoundProducts
            .map((id) => id.split('/').pop() || null)
            .filter((id) => id !== null)
        : [];
    const boundProducts = await getReletedProducts(boundProductsData, locale);
    return (
      <ProductView
        product={product as Product}
        relatedProducts={relatedShopiyProductsData}
        boundProducts={boundProducts}
        locale={locale}
      />
    );
  } catch (e) {
    console.log(e);
    return notFound();
  }
};
const ProductSession = async ({ params }: Props) => {
  const { slug: handle, locale } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return notFound();
  }
  return <ProductSessionView handle={handle} locale={locale} />;
};
