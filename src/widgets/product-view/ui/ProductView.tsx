import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { ProductViewProvider } from './ProductViewProvider';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { getTranslations } from 'next-intl/server';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/ui/breadcrumb';
import { JsonLd } from '@shared/ui/JsonLd';
import { generateBreadcrumbJsonLd } from '@shared/lib/seo/jsonld/breadcrumb';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

export async function ProductView({
  product,
  relatedProducts,
  boundProducts,
  locale,
  attributes,
  children,
}: {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
  boundProducts: ShopifyProduct[];
  locale: string;
  attributes: ProductMEtaobjectType[];
  children: React.ReactNode;
}) {
  const [t, tHeader] = await Promise.all([
    getTranslations({ locale, namespace: 'ProductPage' }),
    getTranslations({ locale, namespace: 'Header' }),
  ]);
  const gender = (product.tags ?? []).some((tag) => {
    const lower = tag.toLowerCase();
    return lower === 'man' || lower.includes('чоловіч');
  })
    ? 'man'
    : 'woman';
  const breadcrumbItems = [
    { name: tHeader('nav.home'), url: `${BASE_URL}/${locale}` },
    {
      name: gender === 'man' ? tHeader('nav.man') : tHeader('nav.woman'),
      url: `${BASE_URL}/${locale}/${gender}`,
    },
    ...(product.vendor
      ? [
          {
            name: product.vendor,
            url: `${BASE_URL}/${locale}/brand/${vendorToHandle(product.vendor)}`,
          },
        ]
      : []),
    { name: product.title, url: `${BASE_URL}/${locale}/product/${product.handle}` },
  ];

  return (
    <div className="container  space-y-16 my-10 h-fit min-h-screen">
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/`}>
              {tHeader('nav.home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${gender}`}>
              {gender === 'man' ? tHeader('nav.man') : tHeader('nav.woman')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {product.vendor && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/brand/${vendorToHandle(product.vendor)}`}>
                  {product.vendor}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ProductViewProvider
        favCommponent={children}
        product={product}
        boundProducts={boundProducts}
        attributes={attributes}
      />
      {relatedProducts && relatedProducts.length > 0 && (
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
      )}

      {/* <ProductComments /> */}
    </div>
  );
}
