import { Metadata } from 'next';

interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://miomio.com.ua';

export function generatePageMetadata(
  seo: SEOData,
  locale: string,
  path: string
): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${BASE_URL}/${locale}${normalizedPath}`;

  return {
    title: seo.title || 'Mio Mio',
    description: seo.description,
    robots: seo.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ru: `${BASE_URL}/ru${normalizedPath}`,
        uk: `${BASE_URL}/uk${normalizedPath}`,
      },
    },
    openGraph: {
      title: seo.title || 'Mio Mio',
      description: seo.description,
      url: canonicalUrl,
      siteName: 'Mio Mio',
      images: seo.image ? [{ url: seo.image, width: 1200, height: 630 }] : [],
      locale: locale === 'uk' ? 'uk_UA' : 'ru_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || 'Mio Mio',
      description: seo.description,
      images: seo.image ? [seo.image] : [],
    },
  };
}

export function generateProductMetadata(
  product: {
    title: string;
    description?: string | null;
    featuredImage?: { url: string } | null;
  },
  locale: string,
  slug: string
): Metadata {
  return generatePageMetadata(
    {
      title: product.title,
      description: product.description || undefined,
      image: product.featuredImage?.url,
    },
    locale,
    `/product/${slug}`
  );
}

export function generateCollectionMetadata(
  collection: {
    title: string;
    description?: string | null;
    image?: { url: string } | null;
  },
  locale: string,
  slug: string,
  gender?: string,
): Metadata {
  const prefix = gender ? `/${gender}` : '';
  return generatePageMetadata(
    {
      title: collection.title,
      description: collection.description || undefined,
      image: collection.image?.url,
    },
    locale,
    `${prefix}/${slug}`
  );
}
