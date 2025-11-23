import { getProduct } from '@/entities/product/api/getProduct';
import { getProductPage } from '@/entities/product/api/getProductPage';
import { ProductView } from '@/widgets/product-view';
import { notFound } from 'next/navigation';
import { Locale } from '@/shared/i18n/routing';

type Props = {
  params: Promise<{ slug: string[]; locale: string }>;
};

export default async function ProductPage({ params }: Props) {
  try {
    const p = await params;
    const variant = p.slug.some((slug) => slug === 'variant')
      ? p.slug[p.slug.indexOf('variant') + 1]
      : undefined;
    const response = await getProduct({ handle: p.slug[0] });
    const product = response?.product;

    if (!product) {
      return notFound();
    }

    const sanityProduct = await getProductPage({
      language: p.locale as Locale,
    });
    const selectedVariant = variant
      ? product.variants.edges.find(
          (e) => e.node.id.split('/').pop() === variant,
        )?.node
      : product.variants.edges[0].node;
    return (
      <ProductView
        product={product}
        selectedVariant={selectedVariant}
        content={sanityProduct?.content}
        sanityDocumentId={sanityProduct?._id}
        sanityDocumentType="page"
      />
    );
  } catch (e) {
    return notFound();
  }
}
