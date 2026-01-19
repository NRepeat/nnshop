import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { Suspense } from 'react';
import { ProductViewProvider } from './ProductViewProvider';
import { ProductDetails } from './ProductDetails';
import { ElegantEase } from './ElegantEase';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import ProductComments from '@entities/product/ui/ProductComments';
import { getTranslations } from 'next-intl/server';

export async function ProductView({
  product,
  relatedProducts,
  locale,
}: {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  return (
    <div className="container  space-y-16 mt-10">
      <Suspense>
        <ProductViewProvider product={product} />
      </Suspense>
      <ProductDetails locale={locale} />
      <ElegantEase locale={locale} />
      <div className="content-stretch flex flex-col gap-[70px] items-center px-0 py-[74px] relative w-full">
        <p className="font-sans leading-[26px] not-italic relative shrink-0 text-[20px] text-black text-center w-full">
          {t('styleWith')}
        </p>
        <div className="content-stretch flex gap-[20px] items-start px-[153px] py-0 relative shrink-0 w-full">
          {relatedProducts.slice(0, 3).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      <ProductComments />
    </div>
  );
}
