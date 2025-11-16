import { getProduct } from '@/entities/product/api/getProduct';
import { ProductView } from '@/widgets/product-view';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string[]; locale: string }>;
};

export default async function ProductPage({ params }: Props) {
  // The getProduct function returns the raw response from the storefront API
  // which has a `product` property inside the `data` property.
  const p = await params;
  const variant = p.slug.some((slug) => slug === 'variant')
    ? p.slug[p.slug.indexOf('variant') + 1]
    : undefined;
  const response = await getProduct({ handle: p.slug[0] });
  const product = response?.product;

  if (!product) {
    return notFound();
  }

  const selectedVariant = variant
    ? product.variants.edges.find((e) => e.node.id.split('/').pop() === variant)
        ?.node
    : product.variants.edges[0].node;
  return <ProductView product={product} selectedVariant={selectedVariant} />;
}
