import { SITE_URL } from '@shared/config/brand';

interface Item {
  handle: string;
}

export function generateItemListJsonLd(products: Item[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/${locale}/product/${product.handle}`,
    })),
  };
}
