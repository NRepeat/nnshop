import { FavSession } from '@features/header/ui/FavSession';
import { Product } from '@shared/lib/shopify/types/storefront.types';

export const GallerySession = async ({
  product,
  isFavorite,
}: {
  product: Product;
  isFavorite: boolean;
}) => {
  return (
    <>
      <FavSession
        fav={isFavorite}
        handle={product.handle}
        productId={product.id}
      />
    </>
  );
};
