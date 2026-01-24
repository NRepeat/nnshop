import {
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { Suspense } from 'react';
import { ProductViewProvider } from './ProductViewProvider';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { getTranslations } from 'next-intl/server';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';

export async function ProductView({
  product,
  relatedProducts,
  boundProducts,
  locale,
  attributes,
}: {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
  boundProducts: ShopifyProduct[];
  locale: string;
  attributes: ProductMEtaobjectType[]
}) {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });

  return (
    <div className="container  space-y-16 mt-10">
      <Suspense>
        <ProductViewProvider
          product={product}
          boundProducts={boundProducts}
          attributes={attributes}
        />
      </Suspense>
      {/*<ProductDetails locale={locale} product={product} />*/}
      {/* <ElegantEase locale={locale} /> */}
      <div className="content-stretch flex flex-col gap-[30px] items-center px-0 py-[30px] relative w-full">
        <p className="font-sans leading-[26px] not-italic relative shrink-0 text-[20px] text-black text-center w-full">
          {t('styleWith')}
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 mx-auto max-w-5xl py-0 w-full">
          {relatedProducts.slice(0, 3).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      {/* <ProductComments /> */}
    </div>
  );
}
