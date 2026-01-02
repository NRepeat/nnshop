import { getProduct } from '@/entities/product/api/getProduct';
import { ProductQuickView } from '@/entities/product/ui/ProductQuickView';
import { QuickView } from '@/widgets/product-view/ui/QuickView';
import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { locales } from '@shared/i18n/routing';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string[] }>;
};
export async function generateStaticParams() {
  const handles = [];
  for (const locale of locales) {
    const allProductsHandlers = await getAllProductHandles(locale);
    handles.push(...allProductsHandlers);
  }
  return handles.map((handle) => ({
    slug: [handle],
  }));
}

export default async function ProductQuickViewPage({ params }: Props) {
  return (
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
  return (
    <QuickView open={Boolean(product)}>
      <ProductSessionView product={product as Product} />
    </QuickView>
  );
};
