import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';

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
    maxVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  availableForSale?: boolean;
  metafields?: Array<{ key: string; value: string } | null> | null;
}

const SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '0',
    currency: 'UAH',
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'UA',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 1,
      unitCode: 'DAY',
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 3,
      unitCode: 'DAY',
    },
  },
};

const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'UA',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
};

export function generateProductJsonLd(product: ShopifyProduct, locale: string) {
  const images = product.images?.edges.map((edge) => edge.node.url) || [];
  if (product.featuredImage && !images.includes(product.featuredImage.url)) {
    images.unshift(product.featuredImage.url);
  }

  const variants = product.variants?.edges.map((e) => e.node) ?? [];
  const isAvailable = product.availableForSale ?? variants.some((v) => v.availableForSale);
  const productUrl = `${BASE_URL}/${locale}/product/${product.handle}`;
  // Use maxVariantPrice to match the price displayed on the product card
  const priceSource = product.priceRange.maxVariantPrice ?? product.priceRange.minVariantPrice;
  const currency = priceSource.currencyCode;
  const originalPrice = parseFloat(priceSource.amount);

  // Discount from znizka metafield (same logic as ProductCardSPP)
  const discountMeta = Array.isArray(product.metafields)
    ? product.metafields.find((m) => m?.key === DISCOUNT_METAFIELD_KEY)
    : null;
  const discountValue = discountMeta ? parseFloat(discountMeta.value) : 0;
  const hasDiscount = discountValue > 0;
  const salePrice = hasDiscount ? originalPrice * (1 - discountValue / 100) : originalPrice;

  const currentPrice = salePrice.toFixed(2);
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const priceSpecification = hasDiscount
    ? [
        {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/SalePrice',
          price: currentPrice,
          priceCurrency: currency,
        },
        {
          '@type': 'UnitPriceSpecification',
          priceType: 'https://schema.org/ListPrice',
          price: originalPrice.toFixed(2),
          priceCurrency: currency,
        },
      ]
    : undefined;

  const baseOffer = {
    availability: isAvailable
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: productUrl,
    priceValidUntil,
    hasMerchantReturnPolicy: RETURN_POLICY,
    shippingDetails: SHIPPING_DETAILS,
    ...(priceSpecification ? { priceSpecification } : {}),
  };

  const offers =
    variants.length > 1
      ? {
          '@type': 'AggregateOffer',
          lowPrice: currentPrice,
          priceCurrency: currency,
          offerCount: variants.length,
          ...baseOffer,
        }
      : {
          '@type': 'Offer',
          price: currentPrice,
          priceCurrency: currency,
          sku: variants[0]?.sku || undefined,
          ...baseOffer,
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
