import {
  getMetaobject,
  ProductMEtaobjectType,
} from '@entities/metaobject/api/get-metaobject';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { getProduct } from '@entities/product/api/getProduct';

import { Product } from '@shared/lib/shopify/types/storefront.types';
import { ProductView } from '@widgets/product-view';
import { notFound } from 'next/navigation';

export const ProductSessionView = async ({
  handle,
  locale,
  children
}: {
  handle: string;
  locale: string;
  children:React.ReactNode
}) => {
  try {
    const { alternateHandle, originProduct: product } = await getProduct({
      handle,
      locale,
    });

    if (!product) {
      return notFound();
    }

    const parseIds = (key: string) => {
      const value = product.metafields.find((m) => m?.key === key)?.value;
      if (!value) return [];
      try {
        const parsed = JSON.parse(value as string) as string[];
        return parsed.map((id) => id.split('/').pop() || '').filter(Boolean);
      } catch {
        return [];
      }
    };

    const relatedProductsIds = parseIds('recommended_products');
    const boundProductsData = parseIds('bound-products');

    const attributesJsonIds = product.metafields.find(
      (m) => m?.key === 'attributes',
    )?.value;
    const parsedAttributeIDs: string[] = attributesJsonIds
      ? JSON.parse(attributesJsonIds as string)
      : [];

    const [relatedShopiyProductsData, boundProducts, attributesResults] =
      await Promise.all([
        getReletedProducts(relatedProductsIds, locale),
        getReletedProducts(boundProductsData, locale),
        Promise.all(parsedAttributeIDs.map((id) => getMetaobject(id))),
      ]);

    const attributes = attributesResults.filter(
      (attr): attr is ProductMEtaobjectType => attr !== null,
    );

    const targetLocale = locale === 'ru' ? 'uk' : 'ru';
    const paths = {
      [locale]: `/product/${handle}`,
      [targetLocale]: `/product/${alternateHandle}`,
    };

    return (
      <>
        <PathSync paths={paths} />
        <ProductView
          attributes={attributes}
          product={product as Product}
          relatedProducts={relatedShopiyProductsData}
          boundProducts={boundProducts}
          locale={locale}
        >
          {children}
        </ProductView>
      </>
    );
  } catch (e) {
    console.error(e);
    return notFound();
  }
};
