import Gallery from '@features/product/ui/Gallery';
import Description from '@features/product/ui/Description';
import { Product } from '@shared/types/product/types';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';

export function ProductView({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: any | undefined;
}) {
  if (!product) throw new Error('Product not found');
  const images =
    product.images?.edges?.length > 0
      ? product.images.edges
      : product.featuredImage
        ? [{ node: product.featuredImage }]
        : [];

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-12 h-screen">
        <Gallery images={images} selectedVariant={selectedVariant} />
        <Description product={product} selectedVariant={selectedVariant} />
      </div>
    </div>
  );
}
