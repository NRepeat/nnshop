import { auth } from '@features/auth/lib/auth';
import { FavSession } from '@features/header/ui/FavSession';
import { isProductFavorite } from '@features/product/api/isProductFavorite';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { headers } from 'next/headers';

export const GallerySession = async ({ product }: { product: Product }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const isFavorite = await isProductFavorite(product.id, session);

  return (
    <>
      <FavSession
        fav={isFavorite}
        productId={product.id}
        handle={product.handle}
      />
    </>
  );
};
