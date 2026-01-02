import { getProduct } from '@/entities/product/api/getProduct';
import { getProductPage } from '@/entities/product/api/getProductPage';
import { ProductView } from '@/widgets/product-view';
import { getAllProductHandles } from '@entities/product/api/getAllProductsHandlers';
import { getProducts } from '@entities/product/api/getProducts';
import { auth } from '@features/auth/lib/auth';
import { locales } from '@shared/i18n/routing';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string[] }>;
};

// export async function generateStaticParams() {
//   const handles = [];
//   for (const locale of locales) {
//     const allProductsHandlers = await getAllProductHandles(locale);
//     handles.push(...allProductsHandlers);
//   }
//   return handles.map((handle) => ({
//     slug: [handle],
//   }));
// }

export default async function ProductPage({ params }: Props) {
  return <ProductSession params={params} />;
}
const ProductSessionView = async ({
  variant,
  handle,
  session,
}: {
  variant?: string;
  handle: string;
  session: { session: Session; user: User };
}) => {
  'use cache';
  try {
    const response = await getProduct({ handle });
    const product = response?.product;

    if (!product) {
      return notFound();
    }

    const relatedProducts = await getProducts({ first: 6 });

    const sanityProduct = await getProductPage();
    const selectedVariant = variant
      ? product.variants.edges.find(
          (e) => e.node.id.split('/').pop() === variant,
        )?.node
      : product.variants.edges[0].node;
    return (
      <ProductView
        product={product as Product}
        //@ts-ignore
        selectedVariant={selectedVariant}
        content={sanityProduct?.content}
        session={session}
        //@ts-ignore
        sanityDocumentId={sanityProduct?._id}
        sanityDocumentType="page"
        //@ts-ignore
        relatedProducts={relatedProducts.products.edges.map((e) => e.node)}
      />
    );
  } catch {
    return notFound();
  }
};
const ProductSession = async ({ params }: Props) => {
  const p = await params;
  const variant = p.slug.some((slug) => slug === 'variant')
    ? p.slug[p.slug.indexOf('variant') + 1]
    : undefined;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return notFound();
  }
  return (
    <ProductSessionView
      variant={variant}
      handle={p.slug[0]}
      session={session}
    />
  );
};
