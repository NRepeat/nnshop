import { auth } from '@features/auth/lib/auth';
import { FavSession } from '@features/header/ui/FavSession';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { headers } from 'next/headers';

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
