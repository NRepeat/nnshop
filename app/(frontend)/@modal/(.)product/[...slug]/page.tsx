import { getProduct } from '@/entities/product/api/getProduct';
import { ProductQuickView } from '@/entities/product/ui/ProductQuickView';
import { QuickView } from '@/widgets/product-view/ui/QuickView';
import { auth } from '@features/auth/lib/auth';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Session, User } from 'better-auth';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string[] }>;
  product: Product;
};

export default async function ProductQuickViewPage({ params }: Props) {
  const p = await params;
  const response = await getProduct({ handle: p.slug[0] });
  const product = response?.product;
  return (
    <QuickView open={Boolean(product)}>
      <Suspense fallback={<div className="h-full w-full">Loading...</div>}>
        <ProductSession params={params} product={product as Product} />
      </Suspense>
    </QuickView>
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

const ProductSession = async ({ params, product }: Props) => {
  // const p = await params;
  // const variant = p.slug.some((slug) => slug === 'variant')
  //   ? p.slug[p.slug.indexOf('variant') + 1]
  //   : undefined;
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) {
  //   return notFound();
  // }
  return <ProductSessionView product={product} />;
};
