import { getProduct } from '@entities/product/api/getProduct';

import { Product } from '@shared/lib/shopify/types/storefront.types';
import { ProductView } from '@widgets/product-view';
import { notFound, unstable_rethrow } from 'next/navigation';
import { PathSync } from '@entities/path-sync/ui/path-sync';

export const ProductSessionView = async ({
  handle,
  locale,
  children,
  searchParams,
}: {
  handle: string;
  locale: string;
  children: React.ReactNode;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  try {
    const { alternateHandle, originProduct: product } = await getProduct({
      handle,
      locale,
    });

    if (!product) {
      return notFound();
    }

    const targetLocale = locale === 'ru' ? 'uk' : 'ru';
    const paths = {
      [locale]: `/product/${handle}`,
      [targetLocale]: `/product/${alternateHandle}`,
    };

    return (
      <>
        <PathSync paths={paths} />
        <ProductView
          product={product as Product}
          locale={locale}
          searchParams={searchParams}
        >
          {children}
        </ProductView>
      </>
    );
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    return notFound();
  }
};
