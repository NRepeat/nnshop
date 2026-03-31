import { auth } from '@features/auth/lib/auth';
import { FavSession } from '@features/header/ui/FavSession';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { ProductSessionView } from '@features/product/ui/ProductSessionView';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { getProduct } from '@entities/product/api/getProduct';
import { notFound } from 'next/navigation';
import { isDevEmail, isDevOnlyHandle } from '@shared/lib/dev-access';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Heart } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Metadata } from 'next';
import { generateProductMetadata } from '@shared/lib/seo/generateMetadata';
import { generateProductJsonLd } from '@shared/lib/seo/jsonld';
import { JsonLd } from '@shared/ui/JsonLd';
import { connection } from 'next/server';
import { ProductViewSkeleton } from '@widgets/product-view/ui/ProductViewSkeleton';
import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { locales } from '@shared/i18n/routing';

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateStaticParams() {
  try {
    const handles = await getAllProductHandles('uk');
    const params = [];
    for (const locale of locales) {
      for (const handle of handles) {
        params.push({ locale, slug: handle });
      }
    }
    return params;
  } catch (error) {
    console.error('Failed to generate static params for products:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { originProduct: product, alternateHandle } = await getProduct({
    handle: slug,
    locale,
  });

  if (!product) {
    notFound();
  }

  return generateProductMetadata(product, locale, decodedSlug, alternateHandle);
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const handle = decodeURIComponent(slug);
  setRequestLocale(locale);

  if (isDevOnlyHandle(handle) && !(await isDevEmail())) {
    notFound();
  }

  const { originProduct: product } = await getProduct({ handle, locale });

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductViewSkeleton handle={handle} />}>
      <ProductContent
        product={product}
        handle={handle}
        locale={locale}
        searchParams={searchParams}
      />
    </Suspense>
  );
}

const ProductContent = async ({
  product,
  handle,
  locale,
  searchParams,
}: {
  product: any;
  handle: string;
  locale: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  await connection();
  return (
    <>
      <JsonLd data={generateProductJsonLd(product, locale)} />
      <ProductSessionView
        handle={handle}
        locale={locale}
        searchParams={searchParams}
      >
        <Suspense
          fallback={
            <Button
              variant="ghost"
              size="icon"
              className="group animate-pulse bg-transparent p-0"
            >
              <Heart className="h-4 w-4" />
            </Button>
          }
        >
          <ProductSession handle={product.id} product={product as Product} />
        </Suspense>
      </ProductSessionView>
    </>
  );
};

const ProductSession = async ({
  handle,
  product,
}: {
  handle: string;
  product: Product;
}) => {
  await connection();

  const session = await auth.api.getSession({ headers: await headers() });

  const isFavorite = await isProductFavorite(handle, session);
  return <FavSession fav={isFavorite} handle={handle} productId={product.id} />;
};
