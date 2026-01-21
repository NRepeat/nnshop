import { getProduct } from '@/entities/product/api/getProduct';
import { ProductView } from '@/widgets/product-view';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { auth } from '@features/auth/lib/auth';
import { locales } from '@shared/i18n/routing';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

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
    const { alternateHandle, originProduct } = await getProduct({
      handle,
      locale,
    });
    const product = originProduct;
    console.log('PRODUCT', product);
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
    const targetLocale = locale === 'ru' ? 'uk' : 'ru';
    const paths = {
      [locale]: `/product/${handle}`,
      [targetLocale]: `/product/${alternateHandle}`,
    };
    return (
      <>
        <PathSync paths={paths} />
        <ProductView
          product={product as Product}
          relatedProducts={relatedShopiyProductsData}
          boundProducts={boundProducts}
          locale={locale}
        />
      </>
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
