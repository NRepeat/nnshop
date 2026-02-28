import { CardCarousel } from '@entities/home/ui/cardCarousel';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { getCollection } from '@entities/collection/api/getCollection';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { ProductCard } from '@entities/product/ui/ProductCard';
type ProductCarouselGridProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'productCarousel' }
> & { locale: string; gender?: string };

export const ProductCarousel = async (props: ProductCarouselGridProps) => {
  const { collection, locale, title } = props;
  const collectionHandle = collection?.handle;
  if (!collectionHandle) return null;
  const shopifyCollection = await getCollection({
    handle: collectionHandle,
    first: 12,
    locale,
  });
  if (!shopifyCollection) return null;
  const products = shopifyCollection.collection?.collection?.products.edges.map(
    (edge) => edge.node,
  );
  const items = products?.map((product, index) => {
    return <ProductCard product={product as Product}  withCarousel={false}  withSizes withInnerShadow
    withQuick={false} className=' hover:shadow rounded-b rounded-t pt-0 px-0 '/>;
  });

  return (
    <div className="product-carousel container">
      <div className="py-8 flex flex-col gap-8">
        <p className="text-3xl md:text-3xl text-center font-400">{title as unknown as string}</p>
        <CardCarousel
          items={items}
          scrollable={true}
          className="basis-1/2 md:basis-1/4 "
        />
      </div>
    </div>
  );
};
