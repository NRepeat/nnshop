import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { getInventoryLevels } from '@entities/product/api/getInventoryLevels';
import { ProductViewProvider } from './ProductViewProvider';
import { getTranslations } from 'next-intl/server';
import { getMetaobject, ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';
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
import { cookies } from 'next/headers';
import { ViewTracker } from '@entities/recently-viewed/ui/ViewTracker';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Gallery from '@features/product/ui/Gallery';
import { getReletedProducts } from '@entities/product/api/get-related-products';

const RelatedProducts = dynamic(() => import('./RelatedProducts').then(mod => mod.RelatedProducts));

const RecentlyViewedSection = dynamic(() => import('@entities/recently-viewed/ui/RecentlyViewedSection').then(mod => mod.RecentlyViewedSection));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

export async function ProductView({
  product,
  locale,
  children,
  quiqView,
}: {
  product: ShopifyProduct;
  locale: string;
  children: React.ReactNode;
  quiqView?: boolean;
}) {
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const cookieStore = await cookies();
  const gender = cookieStore.get('gender')?.value || 'woman';

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
    {
      name: product.title,
      url: `${BASE_URL}/${locale}/product/${product.handle}`,
    },
  ];

  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);

  return (
    <div className="container space-y-16 my-8 h-fit min-h-screen">
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/`}>{tHeader('nav.home')}</BreadcrumbLink>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12 relative">
        <Gallery images={images} productId={product.id} quiqView={quiqView}>
          {children}
        </Gallery>
        
        <Suspense fallback={<ProductInfoSkeleton />}>
          <AsyncProductInfoSection product={product} locale={locale} />
        </Suspense>
      </div>

      <Suspense fallback={<div className="container h-48 animate-pulse bg-muted rounded-xl" />}>
        <AsyncRelatedProductsSection product={product} locale={locale} />
      </Suspense>

      <ViewTracker productHandle={product.handle} productId={product.id} />
      <Suspense fallback={<div className="container h-48 animate-pulse bg-muted rounded-xl" />}>
        <RecentlyViewedSection />
      </Suspense>
    </div>
  );
}

function ProductInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-6 bg-muted rounded w-1/2" />
      <div className="h-10 bg-muted rounded w-1/4" />
      <div className="h-24 bg-muted rounded w-full" />
    </div>
  );
}

async function AsyncProductInfoSection({ product, locale }: any) {
  const parseIds = (key: string) => {
    const value = product.metafields.find((m: any) => m?.key === key)?.value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value as string) as string[];
      return parsed.map((id) => id.split('/').pop() || '').filter(Boolean);
    } catch {
      return [];
    }
  };

  const boundProductsData = parseIds('bound-products');
  const attributesJsonIds = product.metafields.find((m: any) => m?.key === 'attributes')?.value;
  const parsedAttributeIDs: string[] = attributesJsonIds ? JSON.parse(attributesJsonIds as string) : [];
  const variantIds = product.variants.edges.map((e: any) => e.node.id);

  const [boundProducts, attributesResults, inventoryLevels] = await Promise.all([
    getReletedProducts(boundProductsData, locale),
    Promise.all(parsedAttributeIDs.map((id) => getMetaobject(id))),
    getInventoryLevels(variantIds),
  ]);

  const attributes = attributesResults.filter((attr): attr is ProductMEtaobjectType => attr !== null);

  return (
    <ProductViewProvider
      product={product}
      boundProducts={boundProducts}
      attributes={attributes}
      inventoryLevels={inventoryLevels}
    />
  );
}

async function AsyncRelatedProductsSection({ product, locale }: any) {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  const parseIds = (key: string) => {
    const value = product.metafields.find((m: any) => m?.key === key)?.value;
    if (!value) return [];
    try {
      const parsed = JSON.parse(value as string) as string[];
      return parsed.map((id) => id.split('/').pop() || '').filter(Boolean);
    } catch {
      return [];
    }
  };

  const relatedProductsIds = parseIds('recommended_products');
  const relatedProducts = await getReletedProducts(relatedProductsIds, locale);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return <RelatedProducts products={relatedProducts} title={t('styleWith')} />;
}
