import { Product as ShopifyProduct } from '@shared/lib/shopify/types/storefront.types';
import { getInventoryLevels } from '@entities/product/api/getInventoryLevels';
import { ProductViewProvider } from './ProductViewProvider';
import { getTranslations } from 'next-intl/server';
import {
  getMetaobjectsBatch,
  ProductMEtaobjectType,
} from '@entities/metaobject/api/get-metaobject';
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
import { ViewTracker } from '@entities/recently-viewed/ui/ViewTracker';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Gallery from '@features/product/ui/Gallery';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { cleanSlug } from '@shared/lib/utils/cleanSlug';
import { DEFAULT_GENDER } from '@shared/config/shop';
import { SITE_URL } from '@shared/config/brand';
import { GenderSync } from './GenderSync';
import { getBlurDataUrl } from '@shared/lib/image/getBlurDataUrl';
import { GA4ViewItemEvent } from '@shared/lib/analytics/GA4ViewItemEvent';

// Maps custom.gender metaobject handles → app gender keys
const GENDER_HANDLE_MAP: Record<string, 'man' | 'woman' | 'unisex'> = {
  choloviche: 'man',
  zhinoche: 'woman',
  uniseks: 'unisex',
};

function resolveGenderFromMetafield(
  product: any,
): 'man' | 'woman' | 'unisex' | null {
  const refs = product?.genderMetafield?.references?.edges ?? [];
  if (refs.length === 0) return null;
  const handles: string[] = refs
    .map((e: any) => e.node?.handle)
    .filter(Boolean);
  const hasMen = handles.some((h) => GENDER_HANDLE_MAP[h] === 'man');
  const hasWomen = handles.some((h) => GENDER_HANDLE_MAP[h] === 'woman');
  const hasUnisex = handles.some((h) => GENDER_HANDLE_MAP[h] === 'unisex');
  if (hasUnisex || (hasMen && hasWomen)) return 'unisex';
  if (hasMen) return 'man';
  if (hasWomen) return 'woman';
  return null;
}

const RelatedProducts = dynamic(() =>
  import('./RelatedProducts').then((mod) => mod.RelatedProducts),
);

const RecentlyViewedSection = dynamic(() =>
  import('@entities/recently-viewed/ui/RecentlyViewedSection').then(
    (mod) => mod.RecentlyViewedSection,
  ),
);

export async function ProductView({
  product,
  locale,
  children,
  quiqView,
  searchParams,
}: {
  product: ShopifyProduct;
  locale: string;
  children: React.ReactNode;
  quiqView?: boolean;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const tHeader = await getTranslations({ locale, namespace: 'Header' });
  const awaitedSearchParams = searchParams ? await searchParams : {};
  const collectionFromUrl = awaitedSearchParams.collection as
    | string
    | undefined;

  const categoryName = product.productType;
  const allCollections = product.collections?.edges?.map((e) => e.node) || [];

  // Resolve gender from custom.gender metafield (set by update-product-gender-metafield script)
  const resolvedGender = resolveGenderFromMetafield(product);
  const isUnisex = resolvedGender === 'unisex';
  // For URL-based navigation use woman as fallback for unisex
  const gender =
    (resolvedGender === 'unisex' ? DEFAULT_GENDER : resolvedGender) ??
    DEFAULT_GENDER;

  let selectedCollection = null;

  if (collectionFromUrl) {
    selectedCollection = allCollections.find(
      (c) => c.handle === collectionFromUrl,
    );
  }

  if (!selectedCollection && categoryName) {
    // Try to find a collection that matches the product category (productType)
    selectedCollection = allCollections.find(
      (c) =>
        c.title.toLowerCase() === categoryName.toLowerCase() ||
        c.handle.toLowerCase().includes(categoryName.toLowerCase()),
    );
  }

  if (!selectedCollection) {
    // Try to find a collection that matches the resolved gender
    const genderMarker = gender === 'man' ? 'cholov' : 'zhin';
    selectedCollection = allCollections.find(
      (c) =>
        c.handle.toLowerCase().includes(genderMarker) ||
        c.title.toLowerCase().includes(gender === 'man' ? 'чолов' : 'жін'),
    );
  }

  const displayCategory = categoryName || selectedCollection?.title;
  const collectionHandle = cleanSlug(selectedCollection?.handle);

  const genderLabel = isUnisex
    ? tHeader('nav.unisex')
    : gender === 'man'
      ? tHeader('nav.man')
      : tHeader('nav.woman');

  const breadcrumbItems = [
    { name: tHeader('nav.home'), url: `${SITE_URL}/${locale}` },
    {
      name: genderLabel,
      url: `${SITE_URL}/${locale}/${gender}`,
    },
    ...(displayCategory
      ? [
          {
            name: displayCategory,
            url: collectionHandle
              ? `${SITE_URL}/${locale}/${gender}/${collectionHandle}`
              : `${SITE_URL}/${locale}/search?q=${displayCategory}`,
          },
        ]
      : product.vendor
        ? [
            {
              name: product.vendor,
              url: `${SITE_URL}/${locale}/brand/${vendorToHandle(product.vendor)}`,
            },
          ]
        : []),
    {
      name: product.title,
      url: `${SITE_URL}/${locale}/product/${product.handle}`,
    },
  ];

  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const firstImageBlur = images[0]?.url
    ? await getBlurDataUrl(images[0].url)
    : '';

  return (
    <div className="container space-y-16 my-8 h-fit min-h-screen">
      <GenderSync gender={resolvedGender} />
      <GA4ViewItemEvent
        itemId={product.id}
        itemName={product.title}
        price={parseFloat(product.priceRange.minVariantPrice.amount)}
        currency={product.priceRange.minVariantPrice.currencyCode}
        itemBrand={product.vendor}
      />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>
              {tHeader('nav.home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/${gender}`}>
              {genderLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {displayCategory ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={
                    collectionHandle
                      ? `/${locale}/${gender}/${collectionHandle}`
                      : `/${locale}/search?q=${displayCategory}`
                  }
                >
                  {displayCategory}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : product.vendor ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${locale}/brand/${vendorToHandle(product.vendor)}`}
                >
                  {product.vendor}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12 relative">
        <Gallery
          images={images}
          productId={product.id}
          quiqView={quiqView}
          product={product}
          firstImageBlur={firstImageBlur}
        >
          {children}
        </Gallery>

        <AsyncProductInfoSection product={product} locale={locale} />
      </div>

      <Suspense
        fallback={
          <div className="container h-48 animate-pulse bg-muted rounded-xl" />
        }
      >
        <AsyncRelatedProductsSection product={product} locale={locale} />
      </Suspense>

      <ViewTracker productHandle={product.handle} productId={product.id} />
      <Suspense
        fallback={
          <div className="container h-48 animate-pulse bg-muted rounded-xl" />
        }
      >
        <RecentlyViewedSection />
      </Suspense>
    </div>
  );
}

function ProductInfoSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-[30px] w-full">
      {/* Vendor + title + sku + price */}
      <div className="space-y-2">
        <div className="h-7 bg-muted rounded w-40" />
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-32" />
        <div className="flex items-center gap-3 mt-1">
          <div className="h-4 bg-muted rounded w-16 line-through" />
          <div className="h-7 bg-muted rounded w-24" />
          <div className="h-5 bg-muted rounded w-12" />
        </div>
      </div>

      {/* Size selector */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-11 w-14 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/5" />
        <div className="h-4 bg-muted rounded w-24 mt-1" />
      </div>

      {/* Add to cart */}
      <div className="h-12 bg-muted rounded w-full" />

      {/* Quick order + price subscribe */}
      <div className="flex gap-0 w-full">
        <div className="h-12 bg-muted rounded-l w-1/2" />
        <div className="h-12 bg-muted rounded-r w-1/2" />
      </div>

      {/* Accordion */}
      <div className="border-t pt-0 space-y-0">
        <div className="h-12 bg-muted rounded w-full" />
        <div className="h-12 bg-muted rounded w-full mt-px" />
      </div>
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
  const attributesJsonIds = product.metafields.find(
    (m: any) => m?.key === 'attributes',
  )?.value;
  const parsedAttributeIDs: string[] = attributesJsonIds
    ? JSON.parse(attributesJsonIds as string)
    : [];

  const variantIds = product.variants.edges.map((e: any) => e.node.id);

  const [boundProducts, attributesResults, inventoryLevels] = await Promise.all([
    getReletedProducts(boundProductsData, locale),
    getMetaobjectsBatch(parsedAttributeIDs),
    getInventoryLevels(variantIds),
  ]);

  const attributes = attributesResults.filter(
    (attr): attr is ProductMEtaobjectType => attr !== null,
  );

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
