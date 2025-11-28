import Gallery from '@features/product/ui/Gallery';
import Description from '@features/product/ui/Description';
import { Product } from '@shared/types/product/types';
import { PageBuilder } from '@widgets/page-builder';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { PAGE_QUERYResult } from '@shared/sanity/types';
import { isProductFavorite } from '@features/product/api/isProductFavorite';

export async function ProductView({
  product,
  selectedVariant,
  content,
  sanityDocumentId,
  sanityDocumentType,
}: {
  product: Product;
  selectedVariant: ProductVariant | undefined;
  //@ts-ignore
  content: PAGE_QUERYResult['content'];
  sanityDocumentId: string;
  sanityDocumentType: string;
}) {
  if (!product) throw new Error('Product not found');
  const images =
    product.images?.edges?.length > 0
      ? product.images.edges
      : product.featuredImage
        ? [{ node: product.featuredImage }]
        : [];
  const isFavorite = await isProductFavorite(product.id);
  return (
    <div className="container mx-auto py-12 space-y-12">
      {selectedVariant && (
        <div className="grid grid-cols-1 md:grid-cols-8 gap-12 h-full md:h-screen">
          <Gallery
            images={images}
            productId={product.id}
            selectedVariant={selectedVariant}
            isFavorite={isFavorite}
          />
          <Description product={product} selectedVariant={selectedVariant} />
        </div>
      )}
      <PageBuilder
        content={content}
        documentId={sanityDocumentId}
        documentType={sanityDocumentType}
      />
    </div>
  );
}
