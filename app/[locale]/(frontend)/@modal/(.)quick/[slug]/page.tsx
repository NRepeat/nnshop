import { QuickView } from '@/widgets/product-view/ui/QuickView';
import {
  ProductMEtaobjectType,
  getMetaobject,
} from '@entities/metaobject/api/get-metaobject';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductViewProvider } from '@widgets/product-view/ui/ProductViewProvider';

import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProduct } from '@entities/product/api/getProduct';
import { GallerySession } from '@widgets/product-view/ui/GallerySession';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { auth } from '@features/auth/lib/auth';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { ProductSessionViewSkeleton } from './ProductSessionViewSkeleton';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';
import { connection } from 'next/server';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function ProductQuickViewPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductSessionViewSkeleton />}>
      <ProductSession params={params} />
    </Suspense>
  );
}

const ProductSessionView = async ({ params }: Props) => {
  await connection();

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
    return (
      <div className="mt-10">
        <ProductViewProvider
          favCommponent={
            <Suspense
              fallback={
                <Button
                  variant="ghost"
                  size="icon"
                  className="group animate-pulse bg-gray-200 dark:bg-gray-700"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              }
            >
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
  return (
    <QuickView open={Boolean(params)}>
      <ProductSessionView params={params} />
    </QuickView>
  );
};
