const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

interface ProductImage {
  url: string;
}

interface ProductVariant {
  sku?: string | null;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface ShopifyProduct {
  title: string;
  description?: string | null;
  handle: string;
  vendor?: string | null;
  images?: {
    edges: Array<{ node: ProductImage }>;
  };
  featuredImage?: ProductImage | null;
  variants?: {
    edges: Array<{ node: ProductVariant }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  availableForSale?: boolean;
}

export function generateProductJsonLd(product: ShopifyProduct, locale: string) {
  const images = product.images?.edges.map((edge) => edge.node.url) || [];
  if (product.featuredImage && !images.includes(product.featuredImage.url)) {
    images.unshift(product.featuredImage.url);
  }

  const firstVariant = product.variants?.edges[0]?.node;
  const isAvailable =
    product.availableForSale ?? firstVariant?.availableForSale ?? false;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: images.length > 0 ? images : undefined,
    sku: firstVariant?.sku || undefined,
    url: `${BASE_URL}/${locale}/product/${product.handle}`,
    brand: product.vendor
      ? {
          '@type': 'Brand',
          name: product.vendor,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/${locale}/product/${product.handle}`,
    },
  };
}
