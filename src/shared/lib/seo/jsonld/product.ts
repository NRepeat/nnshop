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

  const variants = product.variants?.edges.map((e) => e.node) ?? [];
  const isAvailable = product.availableForSale ?? variants.some((v) => v.availableForSale);
  const productUrl = `${BASE_URL}/${locale}/product/${product.handle}`;
  const currency = product.priceRange.minVariantPrice.currencyCode;

  const offers =
    variants.length > 1
      ? {
          '@type': 'AggregateOffer',
          lowPrice: product.priceRange.minVariantPrice.amount,
          priceCurrency: currency,
          offerCount: variants.length,
          availability: isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: productUrl,
        }
      : {
          '@type': 'Offer',
          price: product.priceRange.minVariantPrice.amount,
          priceCurrency: currency,
          sku: variants[0]?.sku || undefined,
          availability: isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: productUrl,
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: images.length > 0 ? images : undefined,
    sku: variants[0]?.sku || undefined,
    url: productUrl,
    brand: product.vendor
      ? {
          '@type': 'Brand',
          name: product.vendor,
        }
      : undefined,
    offers,
  };
}
