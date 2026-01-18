import { getProduct } from '@/entities/product/api/getProduct';
import { getProductPage } from '@/entities/product/api/getProductPage';
import { ProductView } from '@/widgets/product-view';
import { getMetaobject } from '@entities/metaobject/api/get-metaobject';
import { getReletedProducts } from '@entities/product/api/get-related-products';
import { getProducts } from '@entities/product/api/getProducts';
import { auth } from '@features/auth/lib/auth';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
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
  handle,
  session,
}: {
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
    const res = await getMetaobject();
    const relatedProducts = product.metafields.find(
      (m) => m?.key === 'recommended_products',
    )?.value as any as string;
    const boundProducts = product.metafields.find(
      (m) => m?.key === 'bound-products',
    )?.value as any as string;
    // const parsedBoundProducts = JSON.parse(boundProducts);
    const relatedProductsData = JSON.parse(relatedProducts) as string[];
    const relatedProductsIds = relatedProductsData
      .map((id) => id.split('/').pop() || null)
      .filter((id) => id !== null);
    console.log(
      response,
      res,
      relatedProductsData.map((id) => id.split('/').pop()),
    );

    const relatedShopiyProductsData =
      await getReletedProducts(relatedProductsIds);
    // const sanityProduct = await getProductPage();

    return (
      <ProductView
        product={product as Product}
        relatedProducts={relatedShopiyProductsData}
        locale="en"
      />
    );
  } catch {
    return notFound();
  }
};
const ProductSession = async ({ params }: Props) => {
  const { slug: handle } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return notFound();
  }
  return <ProductSessionView handle={handle} session={session} />;
};
