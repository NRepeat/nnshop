import Gallery from '@features/product/ui/Gallery';
import Description from '@features/product/ui/Description';
import { Product } from '@shared/types/product/types';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { PageBuilder } from '@widgets/page-builder';
import { SimilarProducts } from '@entities/product';
import { getCollection } from '@entities/collection/api/getCollection';

export async function ProductView({
  product,
  selectedVariant,
  content,
  sanityDocumentId,
  sanityDocumentType,
}: {
  product: Product;
  selectedVariant: any | undefined;
  content: any;
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
  const sliderEnable = content.find((c: any) => c._type === 'similarProducts');
  const collectionHandle = sliderEnable
    ? sliderEnable.collection.store.slug.current
    : '';
  const shopifyCollection = await getCollection({ handle: collectionHandle });
  const collection = {};
  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-12 h-full md:h-screen">
        <Gallery images={images} selectedVariant={selectedVariant} />
        <Description product={product} selectedVariant={selectedVariant} />
      </div>
      {/*{sliderEnable && <SimilarProducts collection={sliderEnable.collection} />}*/}
      <PageBuilder
        content={content}
        documentId={sanityDocumentId}
        documentType={sanityDocumentType}
      />
    </div>
  );
}
