import { getProduct } from '@/entities/product/api/getProduct';
import { ProductQuickView } from '@/entities/product/ui/ProductQuickView';
import { QuickView } from '@/widgets/product-view/ui/QuickView';
import { ProductQuickViewSkeleton } from '@entities/product/ui/ProductQuickViewSkeleton';
// import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string[] }>;
};
// export async function generateStaticParams() {
//   const allProductsHandlers = await getAllProductHandles();
//   return allProductsHandlers.map((handle) => ({
//     slug: [handle],
//   }));
// }

export default async function ProductQuickViewPage({ params }: Props) {
  return (
    // <Suspense fallback={<ProductQuickViewSkeleton/>}>
    <Suspense>
      <ProductSession params={params} />
    </Suspense>
  );
}

const ProductSessionView = async ({ product }: { product: Product }) => {
  try {
    if (!product) {
      return notFound();
    }

    return <ProductQuickView product={product as Product} />;
  } catch {
    return notFound();
  }
};

const ProductSession = async ({ params }: Props) => {
  const p = await params;
  const response = await getProduct({ handle: p.slug[0] });
  const product = response?.product;
  // const variant = p.slug.some((slug) => slug === 'variant')
  //   ? p.slug[p.slug.indexOf('variant') + 1]
  //   : undefined;
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) {
  //   return notFound();
  // }
  return (
    <QuickView open={Boolean(product)}>
      <ProductSessionView product={product as Product} />
    </QuickView>
  );
};
