import { QuickView } from '@/widgets/product-view/ui/QuickView';
import {
  ProductMEtaobjectType,
  getMetaobject,
} from '@entities/metaobject/api/get-metaobject';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { locales } from '@shared/i18n/routing';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductViewProvider } from '@widgets/product-view/ui/ProductViewProvider';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProduct } from '@entities/product/api/getProduct';
import { GallerySession } from '@widgets/product-view/ui/GallerySession';
import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
type Props = {
  params: Promise<{ slug: string; locale: string }>;
};
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
export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default async function ProductQuickViewPage({ params }: Props) {
  // return <>h</>
  return (
    <Suspense>
      <ProductSession params={params} />
    </Suspense>
  );
}

const ProductSessionView = async ({ params }: Props) => {
  try {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const { originProduct } = await getProduct({
      handle: slug,
      locale: locale,
    });

    if (!originProduct) {
      return notFound();
    }
    const product = originProduct;

    const boundProductsIds = product.metafields.find(
      (m) => m?.key === 'bound-products',
    )?.value as string | undefined;

    const parsedBoundProducts = boundProductsIds
      ? (JSON.parse(boundProductsIds) as string[])
      : [];
    const boundProductsData =
      parsedBoundProducts.length > 0
        ? parsedBoundProducts
            .map((id) => id.split('/').pop() || null)
            .filter((id): id is string => id !== null)
        : [];
    const boundProducts = await getReletedProducts(boundProductsData, locale);

    const attributesJsonIds = product.metafields.find(
      (m) => m?.key === 'attributes',
    )?.value as string | undefined;

    const parsedIDs = attributesJsonIds
      ? (JSON.parse(attributesJsonIds) as string[])
      : [];

    const attributes: ProductMEtaobjectType[] = [];
    if (parsedIDs.length > 0) {
      const attributePromises = parsedIDs.map((id) => getMetaobject(id));
      const resolvedAttributes = await Promise.all(attributePromises);
      attributes.push(
        ...resolvedAttributes.filter(
          (attr): attr is ProductMEtaobjectType => attr !== null,
        ),
      );
    }
    const session = await auth.api.getSession({ headers: await headers() });
    const isFavorite = await isProductFavorite(product.id, session);
    console.log('🚀 ~ ProductSessionView ~ isFavorite:', isFavorite);
    return (
      <div className="mt-10">
        <ProductViewProvider
          favCommponent={
            <Suspense>
              <GallerySession
                product={product as ShopifyProduct}
                isFavorite={isFavorite}
              />
            </Suspense>
          }
          product={product as ShopifyProduct}
          boundProducts={boundProducts}
          attributes={attributes}
        />
      </div>
    );
  } catch (e) {
    console.error(e);
    return notFound();
  }
};

const ProductSession = async ({ params }: Props) => {
  // const p = await params;
  // const response = await getProduct({ handle: p.slug, locale: p.locale });
  // const product = response?.originProduct;
  // console.log(product);
  return (
    <QuickView open={Boolean(params)}>
      <ProductSessionView params={params} />
    </QuickView>
  );
};
