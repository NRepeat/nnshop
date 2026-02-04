
import { auth } from '@features/auth/lib/auth';
import { FavSession } from '@features/header/ui/FavSession';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { ProductSessionView } from '@features/product/ui/ProductSessionView';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { getProduct } from '@entities/product/api/getProduct';
import { notFound } from 'next/navigation';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Heart } from 'lucide-react';
import { Button } from '@shared/ui/button';
import { Metadata } from 'next';
import { generateProductMetadata } from '@shared/lib/seo/generateMetadata';
import { generateProductJsonLd } from '@shared/lib/seo/jsonld';
import { JsonLd } from '@shared/ui/JsonLd';
import { connection } from 'next/server';


type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { originProduct: product } = await getProduct({
      handle: slug,
      locale,
    });

    if (!product) {
      return { title: 'Product Not Found' };
    }

    return generateProductMetadata(product, locale, decodedSlug);
  } catch {
    return { title: 'Product Not Found' };
  }
}

// export async function generateStaticParams() {
//   try {
//     const params = [];
//     for (const locale of locales) {
//       const allProductsHandlers = await getAllProductHandles(locale);

//       const localeParams = allProductsHandlers.slice(0, 100).map((handle) => ({
//         slug: handle,
//         locale: locale,
//       }));

//       params.push(...localeParams);
//     }

//     return params;
//   } catch (error) {
//     console.error('Failed to generate static params for products:', error);
//     // Fallback to empty array - pages will be generated on-demand
//     return [];
//   }
// }

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params;
  const handle = decodeURIComponent(slug);
  // return <ProductViewSkeleton />;
  const { originProduct: product } = await getProduct({
    handle,
    locale,
  });
  setRequestLocale(locale);

  if (!product) {
    return notFound();
  }
  return (
    <>
      <JsonLd data={generateProductJsonLd(product, locale)} />
      <ProductSessionView handle={handle} locale={locale}>
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
          <ProductSession handle={product.id} product={product as Product} />
        </Suspense>
      </ProductSessionView>
    </>
  );
}

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
