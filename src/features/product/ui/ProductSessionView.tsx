'use cache';

import { getMetaobject, ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';
import { PathSync } from '@entities/path-sync/ui/path-sync';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { getProduct } from '@entities/product/api/getProduct';
import {
  Metaobject,
  Product,
} from '@shared/lib/shopify/types/storefront.types';
import { ProductView } from '@widgets/product-view';
import { cacheLife } from 'next/cache';
import { notFound } from 'next/navigation';

export const ProductSessionView = async ({
  handle,
  locale,
}: {
  handle: string;
  locale: string;
}) => {
  cacheLife('default');
  try {
    const { alternateHandle, originProduct } = await getProduct({
      handle,
      locale,
    });
    const product = originProduct;
    if (!product) {
      return notFound();
    }
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
    const attributesJsonIds = product.metafields.find(
      (m) => m?.key === 'attributes',
    )?.value as any as string;
    const parsedIDs = JSON.parse(attributesJsonIds);
    console.log('🚀 ~ ProductView ~ parsedIDs:', parsedIDs);

    const attributes: ProductMEtaobjectType[] = [];
    for (const id of parsedIDs) {
      const attribute = await getMetaobject(id);
      if (attribute) {
        attributes.push(attribute);
      }
    }
    return (
      <>
        <PathSync paths={paths} />
        <ProductView
          attributes={attributes}
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
